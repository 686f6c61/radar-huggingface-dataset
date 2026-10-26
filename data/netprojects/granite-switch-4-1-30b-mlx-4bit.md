# netprojects/granite-switch-4.1-30b-mlx-4bit

## Resumen

Granite Switch 4.1 30B es un modelo de IBM (publicado el 14 de octubre de 2026) que integra en un único checkpoint tres comportamientos seleccionables por petición: chat convencional, clasificación con probabilidades calibradas sobre opciones etiquetadas y evaluador de seguridad. La versión analizada aquí es una conversión a 4 bits para Apple Silicon realizada por NetProjects (Internet Projects Ltd.) con MLX, publicada el 26 de octubre de 2026 y no afiliada a IBM.

El modelo base es un transformer denso de 28.865.740.800 parámetros con atención GQA, RoPE y 128K tokens de contexto. Sobre él se montan dos adaptadores aLoRA (activated LoRA) almacenados en el propio checkpoint: `decision`, de rango 64, derivado de `ibm-granite/granitelib-core-r1.0`, y `guardian-core`, de rango 16, derivado de `ibm-granite/granitelib-guardian-r1.0`. Todo lo que precede al token de control del adaptador se ejecuta sobre el modelo base congelado, de modo que un mismo prefijo de conversación sirve para chat, decisión y comprobación de seguridad sin recalcular el prefill.

Su relevancia práctica es doble: por un lado, permite clasificación y moderación con salida probabilística (no solo texto generado) en hardware de consumo Apple; por otro, demuestra un patrón de empaquetado en el que varios comportamientos comparten pesos base. Esta conversión incluye un paquete específico, `granite-switch-mlx`, que añade la arquitectura `granite_switch` a MLX-LM, y ocupa 17,6 GB en disco con un pico de memoria medido de 16,7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (IBM Granite 4.1) con GQA y RoPE; adaptadores aLoRA activados por token de control (`granite_switch`) |
| Parametros totales | 28.865.740.800 (28,87 B) segun safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128K tokens (segun la model card) |
| Tipos de cuantizacion | 4 bits afina, group size 64 en este build; existe build de 8 bits (32,1 GB). Adaptadores en bf16 a su rango original (16 y 64) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache-2.0 (igual que el modelo de IBM) |
| Formato de pesos | safetensors cuantizados para MLX (`library_name: mlx`); no se publican GGUF ni pesos bf16 en este repo |

Otros datos del repositorio: 17,6 GB de tamano, pipeline `text-generation`, etiquetas `mlx`, `alora`, `decision`, `guardian`, `apple-silicon`, `4-bit`; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo subyacente es IBM Granite 4.1 30B, un transformer denso con atención de consultas agrupadas (GQA), embeddings rotatorios (RoPE) y ventana de 128K tokens. Sobre la red congelada se aplican dos LoRA activadas: a diferencia de una LoRA convencional, el adaptador no se suma de forma permanente, sino que se activa al alcanzar un token de control concreto en la secuencia. Eso permite que el mismo prefijo de prompt se procese una sola vez y que, a partir de ahí, la generación continue en modo chat, en modo decisión o en modo guardián según el adaptador elegido mediante el argumento `adapter_name` de la plantilla de chat.

El adaptador `decision` (rango 64) produce una distribución de probabilidad sobre opciones etiquetadas leyendo el primer token de respuesta, lo que da puntuaciones calibradas del tipo `{'Payout failures...': 0.993, 'Login...': 0.002, 'Something else': 0.005}`. El adaptador `guardian-core` (rango 16) actúa como juez binario de seguridad y devuelve `{"score": "yes"}` o `{"score": "no"}` para el criterio indicado. La conversión a 4 bits usa cuantización afina con group size 64; los adaptadores se conservan en bf16 a su rango nativo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación consultada. Tampoco se detalla el proceso de entrenamiento de los adaptadores más allá de su procedencia (`granitelib-core-r1.0` y `granitelib-guardian-r1.0`). Esta conversión no reentrena nada: solo cuantiza y empaqueta, e incluye sin cambios `BUILD.md`, `adapter_index.json` y los `io_configs/` de los adaptadores de IBM.

## Capacidades

- Generación de texto conversacional multi-turno con hasta 128K tokens de contexto.
- Clasificación con probabilidad calibrada por opción etiquetada (A, B, C, ...): útil para enrutado y triaje con umbrales explícitos.
- Evaluación de seguridad tipo juez binario (`yes`/`no`) sobre un criterio aportado por el usuario, mediante el adaptador `guardian-core`.
- Conmutación de comportamiento por petición sin recalcular el prefijo de conversación (chat, decisión o guardián sobre el mismo prompt).
- Cobertura multilingüe en 12 idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Generación por lotes (batched generation) y cachés de prompt compatibles con el flujo habitual de MLX-LM.
- Solo texto: el codificador de voz a texto de IBM (Granite Speech 5.0 TurboCTC) no forma parte de este build.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Triaje de tickets de soporte: con el adaptador `decision` se envían el estado del cliente y la lista de colas disponibles, y se obtiene una probabilidad por cola. En la model card, un caso de pagos fallidos devuelve 0,993 para "Payout failures and payment processing", lo que permite enrutar automáticamente con umbral, por ejemplo, 0,9 y derivar el resto a revisión humana.
- Moderación previa a generación: `guardian-core` responde con `{"score": "yes"}` o `{"score": "no"}` ante un criterio de daño, de modo que se puede colocar como filtro de entrada en un pipeline de atención al cliente sin necesidad de un segundo modelo.
- Clasificación con umbrales auditables: al devolver distribuciones de probabilidad en lugar de texto libre, encaja en flujos donde se requiere trazabilidad y un punto de corte configurable (risk scoring, priorización de incidencias, etiquetado de colas).
- Asistente local con privacidad de datos: al ejecutarse en Apple Silicon con MLX y sin llamadas a red, es adecuado para borradores de documentación o resúmenes sobre material que no puede salir del portátil.
- Enrutado multilingüe: con 12 idiomas declarados, un mismo despliegue puede clasificar consultas en español, alemán, japonés o árabe sin modelos separados por idioma.
- Anotación asistida y control de calidad: el adaptador de decisión sirve para preetiquetar ítems con probabilidad asociada, y el guardián para marcar respuestas candidatas antes de la revisión humana.
- Prototipado y evaluación de arquitecturas aLoRA: el paquete `granite-switch-mlx` y la inclusión de los `io_configs` facilitan reproducir el enrutado por token de control en un entorno MLX-LM estándar.
- Pre-filtrado en pipelines de generación: dado que el prefijo compartido se reutiliza, se puede hacer una comprobación de seguridad y, solo si pasa, continuar la misma conversación en modo chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La model card sí incluye verificaciones funcionales frente a la implementación de referencia de IBM:

| Verificacion | Resultado |
|---|---|
| Ejemplo de decisión de la model card de IBM (vLLM: A 0,982 / B 0,0035 / C 0,014) | 0,993 / 0,002 / 0,005; elige A |
| Guardian, prompt dañino frente a benigno | P(yes) 1,00 / 0,00; respuesta `{"score": "yes"}` |
| Enrutado de adaptadores con prompts reales | `decision` y `guardian-core` se activan en sus tokens de control; el chat permanece en el modelo base |
| Implementación MLX frente a la implementación de IBM en Hugging Face (fp32) | Error relativo máximo de logits 4e-7; enrutado y salida greedy idénticos |

Rendimiento medido en un MacBook Pro M5 Max de 128 GB (26 de octubre de 2026, MLX 0.32.4, greedy, una petición a la vez, mediana de 3 ejecuciones tras calentamiento):

| Metrica | 4 bits |
|---|---|
| Generación en chat (respuestas de 512 tokens) | 32 tokens/s |
| Decisión con prompt corto (78 tokens) | 194 ms |
| Decisión con prompt de ~1.200 tokens (mediana / p95 sobre 60 decisiones reales) | 2,0 s / 4,1 s |
| Lectura de prompt a ~1.200 tokens | ~620 tokens/s |
| Memoria pico | 16,7 GB (18,2 GB con prompts de ~1.200 tokens) |

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. Los pesos están cuantizados en formato MLX, por lo que no se pueden cargar directamente en CUDA, vLLM, TGI ni llama.cpp.
- VRAM/memoria unificada: pico medido de 16,7 GB en chat y 18,2 GB con prompts de ~1.200 tokens. En la práctica requiere un Mac con 32 GB de memoria unificada o más para dejar margen al sistema; 64 GB es cómodo.
- GPU recomendadas: chips de la familia M de Apple. Las cifras publicadas corresponden a un M5 Max de 128 GB; no se han publicado mediciones para M1/M2/M3/M4 ni para modelos con menos memoria.
- Cabe en GPU de consumo: sí, en el sentido de Mac de consumo, siempre que haya al menos 32 GB de memoria unificada. No es ejecutable en RTX 4090 ni A100 con este formato.
- Despliegue: paquete `granite-switch-mlx` (instalación desde GitHub) con CLI (`chat`, `decide`, `guard`) y API Python (`gs.load`, `gs.decide`, `gs.guard`); alternativa con MLX-LM estándar llamando antes a `granite_switch_mlx.register()` y seleccionando el adaptador con `adapter_name` en la plantilla de chat.
- Latencia y throughput: 32 tokens/s en generación de 512 tokens; 194 ms por decisión con prompt corto; 2,0 s de mediana y 4,1 s de p95 con ~1.200 tokens; ~620 tokens/s de lectura de prompt. Todo con una sola petición concurrente.
- Para comparar: el build de 8 bits ocupa 32,1 GB y el build de 8B en 4 bits ocupa 5,2 GB (pensado para Mac pequenos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/granite-switch-4.1-30b-mlx-4bit (este) | 28,87 B | 128K | 4 bits MLX, 17,6 GB | Apache-2.0 | MLX en Apple Silicon |
| netprojects/granite-switch-4.1-30b-mlx-8bit | 28,87 B (mismo base) | 128K | 8 bits MLX, 32,1 GB | Apache-2.0 | MLX en Apple Silicon; el más próximo a los pesos originales |
| netprojects/granite-switch-4.1-8b-mlx-4bit | no disponible en la informacion | no disponible | 4 bits MLX, 5,2 GB | Apache-2.0 | MLX en Apple Silicon; para Mac pequenos |
| ibm-granite/granite-switch-4.1-30b (modelo base) | 30 B (nominal) | 128K | Pesos originales (no confirmado el formato exacto) | Apache-2.0 | Referencia en Hugging Face; ejecutable en vLLM segun los datos de IBM citados |

No se dispone de datos de rendimiento comparativo frente a modelos de otros fabricantes (por ejemplo, alternativas densas de ~30 B en inglés) en la información proporcionada, por lo que no se incluye una comparación de calidad.

## Limitaciones y advertencias

- Solo texto: el codificador de voz de IBM no está incluido; no se puede usar para tareas de audio sin anadir componentes externos.
- Dependencia total de Apple Silicon y MLX. No hay GGUF ni pesos compatibles con vLLM, TGI, llama.cpp u Ollama en este repositorio, lo que impide desplegarlo en servidores con GPU NVIDIA.
- La cuantización a 4 bits introduce pérdida de precisión frente a los pesos originales. El propio autor recomienda el build de 8 bits como el más fiel; las verificaciones publicadas comparan contra fp32 con error de 4e-7, pero solo sobre los casos probados.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez. El adaptador `guardian-core` es un juez binario: sus umbrales y su tasa de falsos positivos/negativos no están documentados, por lo que no debe ser el único control de seguridad en producción.
- Las probabilidades de `decision` son calibradas pero dependen del formato del prompt y del conjunto de opciones; conviene validar los umbrales con datos propios antes de automatizar decisiones.
- Riesgo de alucinación inherente al modelo generativo base: las respuestas de chat requieren verificación en dominios factuales.
- Aunque el contexto declarado es de 128K, las mediciones de latencia y memoria publicadas solo llegan a ~1.200 tokens; el comportamiento más allá de esa longitud no está caracterizado.
- Es una conversión de terceros no afiliada a IBM: los problemas de la cuantización o del paquete MLX deben reportarse a NetProjects, no a IBM.
- Licencia Apache-2.0, que permite uso comercial y modificaciones con atribución; se deben conservar los avisos de copyright de IBM y del conversor. No se han identificado restricciones adicionales, aunque no se ha verificado la política de uso aceptable de IBM en esta ficha.
- Validación comunitaria practicamente nula en el momento de la consulta (0 descargas, 0 likes) y publicación muy reciente (26 de octubre de 2026): no hay historial de uso en producción.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad sin probarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/granite-switch-4.1-30b-mlx-4bit
- Modelo base: https://huggingface.co/ibm-granite/granite-switch-4.1-30b
- Build de 8 bits: https://huggingface.co/netprojects/granite-switch-4.1-30b-mlx-8bit
- Build de 8B en 4 bits: https://huggingface.co/netprojects/granite-switch-4.1-8b-mlx-4bit
- Paquete MLX con soporte de la arquitectura `granite_switch`: https://github.com/internet-projects/granite-switch-mlx
- Repositorio de IBM Granite Switch: https://github.com/generative-computing/granite-switch
- MLX: https://github.com/ml-explore/mlx
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
- Politica de uso de IA del autor: https://netprojects.com/standards/ai
- No se han encontrado papers, blogs tecnicos ni demos adicionales en la busqueda web realizada (los resultados obtenidos corresponden a una tienda de electronica y no son relevantes).
