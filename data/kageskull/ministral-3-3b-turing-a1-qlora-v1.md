# kageskull/Ministral-3-3B-turing-a1-qlora-v1

## Resumen

turing-a1 es un adaptador LoRA (entrenado con QLoRA de 4 bits) publicado por el usuario independiente kageskull sobre el modelo base mistralai/Ministral-3-3B-Instruct-2512-BF16 (revision `b6d637bef2393152b3da2b2fde72eecdee30557e`). El repositorio no contiene los pesos del modelo fundacional: solo incluye el adaptador PEFT y los ficheros de tokenizer. Su proposito declarado es un experimento educativo en tareas computacionales muy acotadas: incremento binario, suma unaria y descifrado Cesar con desplazamiento conocido.

El interes practico del modelo es doble. Por un lado, sirve como plantilla reproducible de fine-tuning eficiente en hardware de consumo: el autor registro 816 ejemplos de entrenamiento, 101 de validacion y 101 de test reservado, con una sola epoca, rango 8, alpha 16, objetivo sobre `q_proj` y `v_proj`, limite de 256 tokens de secuencia y acumulacion de gradiente de 16 sobre una NVIDIA RTX 2070. Por otro, es un caso de estudio sobre evaluacion rigurosa, ya que el propio autor documenta que la comparacion completa base frente a adaptador se detuvo tras 57 de 101 peticiones y que no reclama ninguna precision held-out.

Se distribuye bajo licencia Apache 2.0, acumula 0 descargas y 0 likes en el momento de la consulta, y esta explicitamente desaconsejado para decisiones de seguridad, criptanalisis operativo o cualquier uso de alto impacto. El propio autor advierte de que el adaptador puede dar respuestas incorrectas incluso en tareas parecidas a las de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral/Ministral) con adaptador LoRA (PEFT); solo texto |
| Parametros totales | 3B en el modelo base; el adaptador LoRA no contiene los pesos del modelo base |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso un limite de 256 tokens de secuencia) |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit NF4; el modelo base admite otras cuantizaciones mediante herramientas externas, no incluidas en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) mas ficheros de tokenizer |
| Autor | kageskull |
| Modelo base | mistralai/Ministral-3-3B-Instruct-2512-BF16 |
| Revision del modelo base | b6d637bef2393152b3da2b2fde72eecdee30557e |
| Libreria | peft |
| Tarea (pipeline) | text-generation |
| Idioma de la model card | Ingles |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de 3B parametros. La carga requiere Transformers y PEFT, y el codigo facilitado por el autor maneja el caso en que el `model_type` del config sea `mistral3`: en ese escenario toma `config.text_config` y aplica un `key_mapping` que elimina el prefijo `language_model.`. El autor indica que el adaptador se entreno como modelo solo texto y que los componentes de vision no se cargaron, por lo que cualquier inferencia debe hacerse por la via textual.

El entrenamiento uso ejemplos sinteticos y deterministas generados a partir de implementaciones del proyecto ya probadas, con un manifiesto de 816 ejemplos de train, 101 de validacion y 101 de test reservado. Se aplico una sola epoca con QLoRA de 4 bits (NF4), rango 8, alpha 16, sobre las proyecciones `q_proj` y `v_proj`, limite de 256 tokens por secuencia y acumulacion de gradiente de 16 en una RTX 2070. La particion se hizo por grupos de tareas para evitar que ejemplos relacionados cruzaran entre conjuntos, y el split de test no se uso durante el entrenamiento. La perdida registrada fue de 0,381 en entrenamiento y 0,294 en validacion, valores que, como senala el propio autor, no establecen la precision de la tarea. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct (tag `conversational`), supeditada a la carga conjunta con el modelo fundacional.
- Incremento binario en formato completo: un smoke test en formato completo paso, segun el autor.
- Suma unaria: cubierta entre los ejemplos de entrenamiento declarados.
- Descifrado Cesar con desplazamiento conocido: tarea incluida en el conjunto de entrenamiento.
- Razonamiento computacional acotado: es la etiqueta de dominio declarada por el autor (`computational-reasoning`).
- Capacidad multilingue: no disponible.
- Tool calling / function calling: no disponible (no declarado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Modo de pensamiento explicito, vision o audio: no disponible; el autor confirma que es un adaptador solo texto y que los componentes de vision no se cargaron.

## Casos de uso

- Docencia sobre fine-tuning eficiente: el modelo sirve como ejemplo real de QLoRA de 4 bits con rango 8 en una GPU de 8 GB (RTX 2070), util para explicar en un aula como se entrena un adaptador sin tocar los pesos base.
- Practicas de criptografia clasica: para ejercicios de descifrado Cesar con desplazamiento conocido, siempre que el resultado se valide de forma independiente y no se use como herramienta criptografica real.
- Reproducibilidad de experimentos: el manifiesto de 816/101/101 ejemplos y la particion por grupos de tareas permiten replicar el pipeline y auditar la metodologia en un curso o seminario.
- Ensenanza de evaluacion de modelos: el caso documentado de comparacion base frente a adaptador detenida en 57 de 101 peticiones es un ejemplo didactico de evaluacion incompleta y de por que la perdida no equivale a precision.
- Estudio de robustez y casos de fallo: el fallo documentado en una parafrasis corta de una tarea que si paso en formato completo permite analizar sensibilidad a la formulacion del prompt.
- Prototipado educativo de interfaces conversacionales: la aplicacion asociada "Alan Turing: A Tribute in Code" usa una capa de personaje historico separada y basada en evidencias, no incluida en los datos de fine-tuning; el adaptador puede estudiarse como componente aislado de esa arquitectura.
- Banco de pruebas de herramientas PEFT: util para verificar flujos de `PeftModel.from_pretrained`, fusion de adaptadores (`merge_and_unload`) y mapeo de claves antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Metricas reportadas por el autor (no constituyen benchmarks ni medidas de precision):

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | 0,381 |
| Perdida de validacion | 0,294 |
| Ejemplos de entrenamiento | 816 |
| Ejemplos de validacion | 101 |
| Ejemplos de test reservado | 101 |
| Comparacion base frente a adaptador completada | 57 de 101 peticiones (interrumpida) |
| Precision held-out declarada | No reclamada por el autor |
| Smoke test de incremento binario en formato completo | Superado |
| Parafrasis corta de la misma tarea | Fallida |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 3B parametros; valores aproximados, no publicados por el autor): unos 6 GB en BF16/FP16, unos 3-3,5 GB en 8 bits y unos 2 GB en 4 bits, mas 1-2 GB adicionales de overhead por cache KV y activaciones segun contexto y lote.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (por ejemplo RTX 2070, RTX 3060, RTX 4060); A100 o H100 no son necesarias para este tamano, aunque permitirian lotes mayores.
- Compatibilidad con GPU de consumo: si. El autor entreno en una RTX 2070 (8 GB) y la inferencia en 4 bits cabe en tarjetas de 6 GB.
- Opciones de despliegue: Transformers mas PEFT es la via obligatoria para cargar el adaptador sin fusionar; para vLLM, TGI, llama.cpp u Ollama hay que fusionar previamente el adaptador con el modelo base (`merge_and_unload`) y, en el caso de llama.cpp/Ollama, convertir el resultado a GGUF.
- Latencia y throughput estimados: no disponible.
- Nota de dependencia: el adaptador por si solo no es ejecutable; requiere descargar el modelo base en la revision exacta indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| kageskull/Ministral-3-3B-turing-a1-qlora-v1 (este) | 3B (base); adaptador LoRA de rango 8 | No disponible (entrenamiento a 256 tokens) | safetensors (PEFT/LoRA) | Apache 2.0 | Publico en HuggingFace; 0 descargas | Ajuste estrecho en incremento binario, suma unaria y Cesar; evaluacion held-out incompleta |
| mistralai/Ministral-3-3B-Instruct-2512-BF16 (base) | 3B | No disponible en la informacion proporcionada | safetensors (BF16) | Apache 2.0 | Publico en HuggingFace | Modelo fundacional instruct; conserva sus capacidades generales sin el ajuste de turing-a1 |
| Otros modelos de ~3B (por ejemplo Llama 3.2 3B o Qwen2.5 3B) | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: el repositorio no incluye los pesos base, por lo que no puede ejecutarse sin descargar mistralai/Ministral-3-3B-Instruct-2512-BF16 en la revision exacta.
- Cobertura de entrenamiento muy limitada: solo tres tareas estrechas (incremento binario, suma unaria y descifrado Cesar con desplazamiento conocido) y una sola epoca.
- Evaluacion held-out incompleta: la comparacion base frente a adaptador se detuvo tras 57 de 101 peticiones y el autor no reclama ninguna precision held-out.
- Inconsistencia documentada: una parafrasis corta de una tarea que paso en formato completo fallo, lo que indica sensibilidad a la formulacion del prompt.
- Riesgo de alucinacion y de respuestas incorrectas incluso en tareas cercanas a las de entrenamiento.
- No apto para decisiones de seguridad, criptanalisis operativo ni decisiones de alto impacto.
- No debe usarse para proteger informacion ni como fuente de afirmaciones historicas fiables.
- El personaje historico de Turing que aparece en la aplicacion asociada es una capa separada y basada en evidencias, y no forma parte de los datos de fine-tuning.
- Privacidad: el autor recomienda no introducir secretos ni datos sensibles en una aplicacion de chat.
- Licencia: Apache 2.0 tanto en el adaptador como en el modelo base, pero conviene revisar la model card y los terminos del modelo fundacional antes de cualquier uso comercial.
- Idiomas soportados: no especificados; no hay garantia de comportamiento multilingue.
- La busqueda web realizada no aporto informacion adicional sobre el modelo (los resultados obtenidos no guardan relacion con el).

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/kageskull/Ministral-3-3B-turing-a1-qlora-v1
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Codigo de entrenamiento e informe: https://github.com/kagesensei/alanturing/tree/main/model/finetune
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Enlaces adicionales encontrados en la busqueda web: no disponible (los resultados no eran relevantes para el modelo).
