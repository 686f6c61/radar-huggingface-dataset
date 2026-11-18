# convaiinnovations/laya-multilingual

## Resumen

Laya Multilingual es un modelo de clasificación y decisión tipada desarrollado por Convai Innovations (convaiinnovations) dentro de la familia Laya. Se trata de un encoder no autorregresivo basado en mmBERT-base con 322 millones de parámetros, diseñado para recibir un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devolver respuestas tipadas con probabilidades calibradas en un único forward pass. No genera texto, por lo que no hay nada que parsear ni margen para alucinaciones en el sentido generativo clásico.

El modelo cubre más de 100 idiomas y está pensado como el checkpoint de referencia de la familia para todo lo que no sea inglés; el checkpoint `laya` original usa ModernBERT-large (421M parámetros), mientras que esta variante usa mmBERT-base (322M) y es aproximadamente el doble de rápida, con una ventana nominal de 1.024 tokens ampliable a 8.192. Su propuesta encaja en el patrón que el autor denomina "System 1": decisiones rápidas, calibradas y estructuradas, orientadas a enrutado, guardarraíles y moderación en pipelines de producción.

La relevancia actual del modelo está en su enfoque de decisiones calibradas multilingües: frente a los LLM generativos, que requieren parseo y presentan riesgo de alucinación, Laya devuelve etiquetas con probabilidad en una sola pasada. La licencia Apache 2.0 y su tamaño contenido (0,7 GB de repositorio) lo hacen desplegable en infraestructura modesta, incluidas GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (mmBERT-base) |
| Parámetros totales | 321.908.998 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 con `max_len=8192` |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Más de 100 idiomas, entre ellos en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer no autorregresivo construido sobre mmBERT-base, con 322 millones de parámetros y una cabeza de clasificación que responde a preguntas tipadas. La interfaz de decisión admite tipos como `choice` (selección entre criterios definidos) y `noul` (pregunta booleana), devolviendo en cada caso una respuesta tipada acompañada de su probabilidad. El pipeline declarado en Hugging Face es `text-classification`.

La model card menciona calibración de decisiones (RLCD, "calibrated decisions") como parte del diseño, y el ecosistema incluye la posibilidad de entrenar motores de decisión propios mediante la herramienta Studio de Embedding Space, que genera un fichero de política firmado ejecutable localmente con `vegaml`. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La ventana de contexto nominal es de 1.024 tokens, ampliable a 8.192, y el modelo está optimizado para velocidad: según el autor, es aproximadamente el doble de rápido que el checkpoint inglés.

## Capacidades

- Clasificación y enrutado multilingüe: asigna departamento, categoría o intención a partir de un estado textual, con más de 100 idiomas cubiertos.
- Respuestas tipadas con probabilidad: devuelve elecciones (`choice`) y booleanos (`noul`) calibrados en un único forward pass, sin generación de texto.
- Decisiones calibradas: las probabilidades están pensadas para umbrales operativos en producción (guardarraíles, moderación, enrutado).
- Procesamiento de documentos largos: hasta 8.192 tokens con `max_len=8192`, útil para correos, tickets e hilos extensos.
- Entrada estructurada: acepta estados en texto plano o JSON.
- Enrutado automático de idioma: integración con `Router` para alternar entre el checkpoint inglés y este multilingüe según el script de la entrada.
- Sin tool calling ni function calling en el sentido de los LLM generativos: la interfaz es de preguntas y respuestas tipadas.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el cuerpo del ticket y una pregunta `choice` con criterios (facturación, técnico, ventas) y devuelve el departamento con probabilidad, lo que permite derivar automáticamente en más de 100 idiomas sin parsear texto generado.
- Moderación y guardarraíles: preguntas booleanas (`noul`) sobre si un mensaje contiene una solicitud de reembolso, una queja o contenido que requiere revisión, con umbrales calibrados para reducir falsos positivos.
- Triaje de correo entrante: clasificación de correos en categorías operativas usando la ventana ampliada a 8.192 tokens para hilos largos, con respuestas estructuradas listas para un sistema de gestión.
- Atención al cliente multilingüe: detección de intención y departamento en conversaciones multi-turno, aprovechando la cobertura de idiomas y la velocidad (aproximadamente el doble que el checkpoint inglés) para servir peticiones en tiempo real.
- Extracción de señales en pipelines de datos: clasificación de documentos JSON o texto en categorías tipadas para enriquecimiento de datasets y análisis, sin riesgo de alucinación generativa.
- Enrutado de modelos en producción: uso del `Router` para decidir si una petición va al checkpoint inglés o a este multilingüe, manteniendo ambos residentes con `preload` para evitar intercambios en cada cambio de idioma.
- Verificación de políticas internas: preguntas booleanas sobre si un texto cumple una política (por ejemplo, si solicita dinero), integrables en flujos de aprobación automatizada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre las 51 lenguas de MASSIVE, clasificación de intención con 20 opciones (aleatorio = 0,050), con preguntas idénticas para ambos checkpoints:

| Métrica | `laya` (inglés) | `laya-multilingual` |
|---|---|---|
| Exactitud macro | 0,227 | 0,366 |
| ECE macro | 0,733 | 0,387 |
| Lenguas que superan 3x el azar | 23 / 51 | 45 / 51 |

El autor señala además que el checkpoint inglés colapsa fuera del inglés manteniendo alta confianza: jemer con 0,000 de exactitud a 0,952 de confianza, hebreo 0,060, armenio 0,050 (exactamente azar) y bengalí 0,080. En documentos largos, de 20 peticiones se respondieron correctamente entre 16 y 18 con hasta unos 4.000 tokens de texto previo; más allá, los resultados varían entre 8 y 17 de 20. Una entrada de 4.000 tokens tarda aproximadamente 1,7 s en una GPU de Apple. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,7 GB en safetensors; en FP32 serían aproximadamente 1,3 GB de pesos, y en FP16 alrededor de 0,65 GB, más overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; A100, H100 o RTX 4090 no son necesarias por tamaño, pero aportan throughput en servidores.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; también se ha probado en GPU de Apple (aproximadamente 1,7 s para 4.000 tokens).
- Opciones de despliegue: `transformers`, paquete `laya` (`pip install laya`), endpoints compatibles y despliegue en Azure según los tags del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el autor indica que es aproximadamente 2x más rápido que el checkpoint inglés; la velocidad sigue la longitud real de la entrada, no el límite configurado. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `convaiinnovations/laya-multilingual` | 322M | 1.024 (hasta 8.192) | 100+ | Apache 2.0 | Decisiones tipadas no autorregresivas |
| `convaiinnovations/laya` | 421M | 512 | Inglés | Apache 2.0 | Decisiones tipadas no autorregresivas |
| `convaiinnovations/laya-typed-decisions` | 421M | 1.024 | No disponible | Apache 2.0 | Flujos de decisiones tipadas |

No se dispone en la información proporcionada de comparaciones con otros modelos de clasificación multilingüe de terceros (por ejemplo, mBERT o XLM-R); por tanto, esa comparación se considera no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o diálogo abierto.
- Riesgo de calibración fuera de dominio: aunque las probabilidades están calibradas, el autor advierte que la confianza del modelo no avisa cuando un checkpoint no puede leer su entrada; el enrutado por script se decide antes del forward pass precisamente por este motivo.
- Documentos largos: por encima de unos 4.000 tokens la exactitud varía (8 a 17 de 20 en las pruebas del autor), por lo que conviene validar en datos propios.
- Cobertura desigual por idioma: incluso en el checkpoint multilingüe, solo 45 de 51 lenguas de MASSIVE superan 3x el azar; el rendimiento no es uniforme.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un clasificador, puede heredar sesgos de los datos de entrenamiento no detallados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del paquete `laya` y del ecosistema Studio/`vegaml`.
- Caveat de despliegue: `laya.load()` puede colgarse si TensorFlow está instalado por un deadlock del runtime abseil; se recomienda ejecutar con `USE_TF=0`.
- Idiomas con escritura latina sin acentos (español, italiano, portugués, francés) y texto romanizado pueden llegar a este checkpoint a través del router; verificar el enrutado en cargas mixtas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/convaiinnovations/laya-multilingual
- Familia Laya: https://huggingface.co/convaiinnovations/laya
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Studio de Embedding Space: https://studio.embedding.in
- Gráfico de exactitud en contexto largo: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/long_context_8192.png
