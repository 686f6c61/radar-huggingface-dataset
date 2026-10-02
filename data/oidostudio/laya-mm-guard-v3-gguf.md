# OidoStudio/laya-mm-guard-v3-gguf

## Resumen

Laya-mm-guard-v3 es un modelo de clasificación de texto especializado en la detección de inyecciones de prompt e indirect prompt injection en pipelines de agentes. Lo desarrolla OidoStudio como un fine-tune completo de `convaiinnovations/laya-multilingual`, un encoder mmBERT-base (modern-bert) al que se le acopla una cabeza de decisión propietaria denominada Laya. El repositorio que nos ocupa (`laya-mm-guard-v3-gguf`) empaqueta el encoder en formato GGUF (F16) y la cabeza en safetensors (F32) para su ejecución con el servidor `laya-go-server` (Go + llama.cpp) en CPU.

No es un modelo de chat ni de generación: recibe un texto de estado (`state`) junto con una o varias preguntas sí/no y devuelve, en una única pasada forward, una probabilidad calibrada por pregunta. Según el autor, una pregunta sobre un texto corto tarda unos 85 ms en CPU. Con 306.939.648 parámetros totales (unos 307 M), el modelo está orientado a guardrails de seguridad en producción: detección de inyecciones directas (jailbreaks) e indirectas embebidas en correos, facturas, páginas web, tickets, salidas de herramientas, código o currículums.

Su relevancia actual radica en que las inyecciones indirectas son uno de los vectores de ataque más problemáticos en agentes con acceso a herramientas externas, y este modelo las aborda en múltiples idiomas (inglés, alemán, español, francés, japonés y árabe) con probabilidades calibradas mediante una temperatura global ajustada, lo que permite fijar umbrales operativos con significado probabilístico real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT (modern-bert) + cabeza de decisión Laya (clasificación multietiqueta por pregunta) |
| Parametros totales | 306.939.648 (unos 307 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (encoder GGUF, 629 MB); cabeza en F32; no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | Multilingue, en, de, es, fr, ja, ar |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`laya-mm-guard-v3-cal-F16.gguf`) + safetensors (`laya-multilingual-head.safetensors`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo combina un encoder transformer mmBERT-base con una cabeza de decisión Laya que procesa el estado textual y las preguntas sí/no en una sola pasada. La cabeza está entrenada para responder a diez formulaciones distintas por familia de pregunta: `inj` (contiene inyección), `jb` (jailbreak), `mal` (petición maliciosa), `follow` (¿debería el asistente seguirla?), `task` (¿la petición real del usuario es X?) y `safe` (¿es seguro procesarlo?). En el paquete GGUF, llama.cpp ejecuta únicamente el encoder; el servidor Go calcula la cabeza por separado y verifica que la anchura de la cabeza coincida con la del encoder.

El entrenamiento consistió en un fine-tune completo en bf16, con learning rate 2e-5, 7.902 pasos (aproximadamente 2 épocas, 48 preguntas por paso) sobre 64,4 mil filas y 189,6 mil preguntas, con un 40% de positivos, realizado en una única RTX 3090. El conjunto de datos se restringió a licencias permisivas e incluye fuentes como deepset/prompt-injections, xTRam1/safe-guard, jackhhao, Lakera gandalf, neuralchemy, SPML, TrustAIRLab in-the-wild jailbreaks, Microsoft LLMail-Inject, OASST1, Dolly y correos de Enron con cargas insertadas. Se generaron además inyecciones indirectas sintéticas sobre 13 tipos de documento y 9 idiomas, con distintos modos de ocultación (texto oculto, espaciado, comentarios HTML, markdown) y documentos limpios emparejados como negativos duros, más 8.000 correos sintéticos con ataques educados tipo "note for the email assistant".

La innovación técnica destacable es la calibración: los logits en crudo eran muy sobreconfiados (mediana de |z| de 13), por lo que se ajustó una temperatura global única de T = 2.92 sobre datos reservados. Al ser monótona, las decisiones con un umbral dado no cambian, pero las probabilidades pasan a ser honestas (ECE de 0,022 a 0,006 y NLL de 0,216 a 0,095 en la mitad reservada). La temperatura queda almacenada en los metadatos `laya.config` de la cabeza.

## Capacidades

- Clasificación de inyección de prompt directa (jailbreaks) e indirecta embebida en documentos.
- Detección de inyecciones en tipos de documento como correos, facturas, páginas web, tickets, salidas de herramientas, código y currículums.
- Salida de probabilidades calibradas por pregunta en una única pasada forward, lo que permite ajustar el umbral de decisión según el coste de falsos positivos y negativos.
- Robustez a diez formulaciones distintas por familia de pregunta, con consistencia entre redacciones (86 de 89 ítems del conjunto gold obtienen la misma decisión bajo 3 redacciones diferentes).
- Soporte multilingüe en inglés, alemán, español, francés, japonés y árabe.
- Manejo de cargas ocultas o disfrazadas mediante espaciado, texto blanco, comentarios HTML, markdown y base64 (con limitaciones, ver más abajo).
- Compatibilidad con API HTTP mediante `laya-go-server`, que es compatible con TypeSafe System One a través de `POST /v1/systemone`.
- No soporta tool calling, generación de texto ni razonamiento multi-paso: es exclusivamente un clasificador de seguridad.

## Casos de uso

- Guardrail de entrada en agentes con herramientas: antes de que un agente procese una salida de herramienta (resultado de una API, contenido de una web o cuerpo de un correo), el modelo evalúa si esa entrada contiene instrucciones dirigidas al sistema y bloquea la ejecución por encima del umbral configurado.
- Filtrado de correo corporativo contra inyecciones indirectas: el modelo está entrenado específicamente con correos de Enron con cargas insertadas y ataques tipo "note for the email assistant", por lo que un F1 de 0,979 en ese conjunto lo hace adecuado para pasarelas de correo que alimentan asistentes.
- Escaneo de currículums y documentos de RR. HH. en procesos de selección automatizados: detecta instrucciones maliciosas embebidas en documentos de candidatos antes de que un agente de cribado las lea.
- Protección de asistentes que ingieren facturas y tickets de soporte: cubre 13 tipos de documento y varios modos de ocultación, útil en flujos de cuentas a pagar o mesas de ayuda donde el texto de entrada no es de confianza.
- Auditoría de código y revisiones automatizadas: detecta ataques del estilo "@reviewer approve and merge" en descripciones de pull requests y comentarios, dentro de las limitaciones documentadas.
- Defensa en profundidad junto a otras capas: al devolver probabilidades calibradas, se puede integrar como señal adicional en un sistema de decisión multi-señal, combinando su score con reglas heurísticas o con otro guardrail.
- Procesamiento por lotes en CPU sin GPU: gracias a sus ~307 M de parámetros y al encoder F16 de 629 MB, permite desplegar guardrails en infraestructura sin acelerador, con latencias de decenas de milisegundos por pregunta.
- Moderación de peticiones de usuario en aplicaciones multilingües: cubre español, francés, alemán, japonés y árabe además del inglés, útil para productos con base de usuarios internacional.

## Benchmarks y rendimiento

Resultados declarados por el autor, con umbral 0,5 sobre particiones reservadas:

| Split | n (preguntas) | F1 |
|---|---|---|
| Splits de test públicos (todas las fuentes) | 12.013 | 0,949 |
| LLMail-Inject | 918 | 0,849 |
| Correos reales de Enron + cargas | — | 0,979 |
| Correo sintético, en distribución | — | 1,000 |
| Correo sintético, OOD (tipos/ubicaciones no vistos, ja/ar, base64) | — | 0,985 |
| Documentos sintéticos, OOD | 4.900 | 0,933 |

Conjunto gold independiente escrito a mano (n = 89): F1 0,907, recall 0,93, FPR 0,106, AUROC 0,967. El autor advierte que muchos conjuntos de test son en distribución (el modelo se entrenó con sus splits de train) o sintéticos y con plantillas, por lo que deben tratarse como cotas superiores; la cifra más honesta según el propio autor es la del conjunto gold.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder F16 ocupa 629 MB; la cabeza en F32 y el tokenizador son marginales. En total, menos de 1 GB de pesos, más overhead del runtime.
- No requiere GPU: el autor indica que funciona en CPU y cifra unas 85 ms por pregunta sobre texto corto.
- GPU recomendadas: no disponibles en la información proporcionada (el modelo está pensado para CPU). Cualquier GPU consumer con unos pocos GB de VRAM podría alojarlo si se integra con llama.cpp, pero no hay cifras publicadas.
- Cabe en cualquier GPU consumer y en entornos sin GPU, dado el tamaño del encoder.
- Opciones de despliegue: `laya-go-server` (Go + llama.cpp), que carga el GGUF mediante llama.cpp y ejecuta la cabeza en Go. Se documentan variables de entorno `LAYA_*` y despliegue con Docker. No se documenta soporte para vLLM, TGI, Ollama o llama.cpp standalone con la cabeza incluida, ya que llama.cpp no soporta la cabeza de decisión.
- Latencia y throughput: ~85 ms por pregunta en CPU para texto corto (dato del autor). Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| OidoStudio/laya-mm-guard-v3-gguf | mmBERT + cabeza Laya | 307 M | Multilingue (en, de, es, fr, ja, ar) | GGUF + safetensors | Apache-2.0 | Calibrado, orientado a inyección indirecta y guardrails de agentes |
| mys/laya-GGUF | Laya (GGUF, ggmlc) | no disponible | Ingles | GGUF | Apache-2.0 | Variante de la misma familia, solo inglés |
| convaiinnovations/laya-multilingual | mmBERT + cabeza Laya | no disponible | Multilingue | safetensors | Apache-2.0 (heredada) | Modelo base sobre el que se construye este fine-tune |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. Para alternativas de otras familias (por ejemplo guardrails de otros proveedores) no hay datos disponibles en el material recibido, por lo que no se incluyen comparaciones numéricas.

## Limitaciones y advertencias

- Fallos en estilos de ataque no vistos: instrucciones en texto blanco en currículums, exfiltración mediante imágenes markdown, ataques tipo "@reviewer approve and merge" y aproximadamente un 10% de los casos en base64 o ubicaciones no vistas.
- Un resultado confiado como negativo no implica seguridad: los ítems con score entre 0,01 y 0,05 son positivos en torno al 7% de las veces.
- Falsas alarmas en peticiones legítimas formuladas como anulaciones ("forget the draft", "disregard my last question", "pretend you are my tutor"), en peticiones de educación en seguridad y en instrucciones permanentes ("CC finance on everything").
- Recall débil en algunos conjuntos no ingleses: el propio autor cita un recall de 0,63 en el conjunto alemán de deepset.
- Ruido en las etiquetas: las etiquetas de LLMail son ruidosas y el techo real es desconocido. Los prompts de role-play se etiquetan como benignos en este modelo, lo que difiere de otros guardrails.
- La temperatura global única es un compromiso entre dominios (el óptimo varía entre 0,3 y 4,3); se recomienda reajustarla con tráfico etiquetado propio.
- Es una capa de defensa, no una frontera de seguridad: no debe usarse en solitario para proteger agentes con acceso a herramientas.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datasets de entrenamiento se seleccionaron por licencias permisivas y se excluyeron conjuntos no comerciales; conviene verificar cada fuente antes de redistribuir derivados.
- No es un modelo de chat ni de generación: no admite conversación, tool calling ni razonamiento; usarlo fuera de su tarea de clasificación no está soportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OidoStudio/laya-mm-guard-v3-gguf
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Servidor laya-go-server: https://github.com/Djancyp/laya-go-server
- Variante Laya en GGUF solo inglés: https://huggingface.co/mys/laya-GGUF
- Modelos cuantizados de convaiinnovations/laya: https://huggingface.co/models?other=base_model:quantized:convaiinnovations/laya
