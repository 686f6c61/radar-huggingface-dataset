# lacuna-ai/lacuna-altus

## Resumen

Lacuna Altus es un modelo de clasificación de texto desarrollado por lacuna-ai que evalúa en qué medida una oferta de empleo encaja con el currículum de una persona candidata, ejecutándose íntegramente en el navegador y en el dispositivo del usuario. Es la versión grande (395M de parámetros) de la extensión de Chrome Lacuna y actúa como modelo maestro (teacher) de Lacuna Celer, la variante destilada y rápida que sirve por defecto.

Técnicamente es una versión fine-tuned de ModernBERT-large con cinco cabezas de clasificación que predicen, en una sola pasada, un veredicto global (apply / stretch / skip), la elegibilidad por ubicación, la correspondencia de seniority, el cumplimiento de requisitos imprescindibles y una cobertura línea a línea de la oferta. Está cuantizado y distribuido en formato ONNX para su uso con transformers.js y WebGPU.

Su relevancia reside en dos puntos: primero, aborda un caso de uso concreto (triaje de ofertas frente a CV) con un modelo compacto que respeta la privacidad al no salir los datos del dispositivo; segundo, documenta con transparencia sus limitaciones, incluido el hecho de que sus etiquetas provienen de un LLM (DeepSeek V4.1 Flash) y no de reclutadores humanos, y que está pensado exclusivamente como ayuda para quienes buscan empleo, no para filtrar candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) fine-tuned con 5 cabezas de clasificación |
| Parametros totales | 395M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | fp16 (publicado); se probó una build 4-bit de 297 MB y no se publicó por pérdida de 0,05 de F1 en verdict |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (model_fp16.onnx, 790 MB) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-large, un encoder transformer moderno con atención eficiente y soporte nativo de secuencias largas de hasta 8.192 tokens (aquí limitado a 4.096). Sobre el backbone se añaden cinco cabezas de clasificación: `verdict` (3 clases), `location` (3 clases), `seniority` (3 clases), `must_met` (2 clases) y dos cabezas por token, `line_met` (4 clases) y `line_must` (probabilidad), que permiten evaluar cada línea de la oferta de forma independiente.

Los datos de entrenamiento combinan unos 82.000 ofertas públicas de empleo con 2.217 CV sintéticos generados por un LLM a partir de trayectorias profesionales realistas, formando 12.699 pares CV × oferta etiquetados (10.171 entrenamiento / 1.270 validación / 1.258 test, divididos por CV). Las etiquetas no provienen de reclutadores humanos: DeepSeek V4.1 Flash leyó cada par con una rúbrica fija (requisitos cubiertos, parcialmente cubiertos o no cubiertos, elegibilidad por ubicación, años y nivel), y el veredicto se deriva de esas respuestas mediante reglas, no se pregunta directamente. Es, por tanto, un caso de destilación desde un LLM hacia un encoder compacto.

El entrenamiento se realizó durante 6 épocas con lr 3e-5, optimizador AdamW en 8 bits, secuencias de 4.096 tokens, sobre 2 GPUs T4 durante unas 7 horas. En inferencia, los logits de cada cabeza se dividen por temperaturas de calibración incluidas en `jobfit.json` antes del softmax para obtener probabilidades calibradas.

## Capacidades

- Clasificación conjunta de CV y oferta de empleo (hasta 4.096 tokens combinados) en una sola pasada.
- Veredicto global de encaje en tres clases: apply (aplicar), stretch (ambicioso) o skip (descartar).
- Predicción de elegibilidad geográfica (yes / unclear / no) según la ubicación requerida por la oferta.
- Comparación de seniority entre el nivel de la persona candidata y el que pide la oferta (below / at / above).
- Detección de cumplimiento de requisitos imprescindibles (must-have) de la oferta.
- Análisis línea a línea de la oferta: para cada línea de 15 o más caracteres, indica si es un requisito, si es imprescindible y si el CV lo cubre (none / yes / partial / no), lo que permite señalar lagunas concretas.
- Ejecución local en el navegador mediante ONNX con transformers.js y WebGPU, sin enviar datos a servidores.
- Salidas calibradas mediante temperaturas publicadas en `jobfit.json`.

No soporta generación de texto, razonamiento multi-paso, tool calling, ni modalidades de visión o audio: es un clasificador especializado.

## Casos de uso

- Triaje personal de ofertas de empleo: la extensión Lacuna ordena las ofertas para leer primero las prometedoras y oculta las que no encajan, aprovechando la inferencia local en el navegador.
- Identificación de lagunas antes de aplicar: las cabezas por línea señalan qué requisitos imprescindibles de la oferta no cubre el CV, permitiendo preparar la candidatura o descartarla con criterio.
- Evaluación de elegibilidad geográfica: detecta ofertas cuya ubicación o modalidad de trabajo remoto no es compatible con la localización de la persona, por ejemplo ofertas de remoto solo para EE. UU.
- Ajuste de nivel (seniority): avisa cuando una oferta está por debajo o muy por encima del nivel de la persona, evitando candidaturas mal orientadas.
- Integración en herramientas de navegador propias: el formato ONNX y las instrucciones detalladas de entrada/salida permiten replicar la funcionalidad en otras extensiones o aplicaciones web con WebGPU.
- Investigación en destilación de LLMs hacia encoders: el repositorio incluye el pipeline de entrenamiento completo, útil como referencia para reproducir esquemas similares de etiquetado por LLM y destilación.
- Procesamiento privado de datos sensibles: al ejecutarse en el dispositivo, el CV nunca sale del equipo del usuario, lo que es adecuado para un documento personal como el currículum.

## Benchmarks y rendimiento

Macro-F1 sobre el conjunto de test (1.258 pares, CVs nunca vistos en entrenamiento ni en los pares de destilación):

| Model | Params | Verdict | Seniority | Location | Must-haves | Req. lines |
|---|---|---|---|---|---|---|
| **Lacuna Altus** (este modelo) | 395M | 0,671 | **0,731** | 0,901 | 0,806 | **0,715** |
| Lacuna Celer (destilado de Altus) | 68M | **0,686** | 0,718 | **0,903** | **0,810** | 0,709 |
| Ettin-68M, mismos datos, sin destilacion | 68M | 0,654 | 0,667 | 0,891 | 0,804 | 0,686 |

Los propios autores señalan que, tras la destilación, el modelo pequeño rinde igual que este en datos reservados (las diferencias están dentro del ruido entre semillas; Altus es una única ejecución). Altus se ofrece para usuarios con GPU capaz que prefieran el modelo original, y fue el mejor en verdict de validación entre todas las ejecuciones en el momento de la selección.

## Requisitos de hardware

- VRAM estimada: unos 2 GB libres en GPU para ejecutar `model_fp16.onnx` (790 MB en fp16).
- GPU recomendada: cualquier GPU con WebGPU y ~2 GB disponibles; no se requiere hardware de centro de datos. El entrenamiento original se hizo en 2× NVIDIA T4, pero eso no aplica a la inferencia.
- Consumer GPUs: sí, está diseñado para ejecutarse en el navegador del usuario final mediante WebGPU, por lo que GPUs de consumo modernas (por ejemplo RTX de serie 30/40 o equivalentes con soporte WebGPU) son suficientes. No cabe razonablemente en CPU o en dispositivos sin GPU dedicada en fp16, según la información disponible.
- Opciones de despliegue: transformers.js con backend ONNX y WebGPU en el navegador (uso previsto). No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, al tratarse de un encoder ONNX de clasificación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Caracteristica | Lacuna Altus | Lacuna Celer | Ettin-68M (mismos datos) |
|---|---|---|---|
| Parametros | 395M | 68M | 68M |
| Base | ModernBERT-large | Destilado de Altus | Ettin-68M |
| Contexto | 4.096 tokens | No disponible | No disponible |
| F1 verdict (test) | 0,671 | 0,686 | 0,654 |
| F1 must-haves (test) | 0,806 | 0,810 | 0,804 |
| Licencia | MIT | No disponible | No disponible |
| Disponibilidad | ONNX fp16, 790 MB, HuggingFace | HuggingFace (lacuna-ai/lacuna-celer) | No disponible en esta ficha |

La comparación relevante es interna: el modelo destilado de 68M iguala o supera a Altus en la mayoría de métricas de test, de modo que Altus se justifica principalmente por preferencia por el modelo original y por haber sido el mejor en validación en verdict. No se dispone de comparativas frente a clasificadores de job-matching de terceros en la información proporcionada.

## Limitaciones y advertencias

- Uso restringido a personas que buscan empleo: no debe emplearse para filtrar, ordenar o rechazar candidatos en procesos de selección; no fue construido ni evaluado para ello, y las decisiones de contratación requieren juicio humano y, en muchas jurisdicciones, garantías legales.
- Sesgo heredado del LLM etiquetador: las etiquetas provienen del juicio de DeepSeek V4.1 Flash con una rúbrica fija, no de reclutadores; el modelo no puede ser mejor que ese juicio y arrastra sus sesgos.
- CVs sintéticos en entrenamiento: los CV reales son más desordenados que los generados; es recomendable normalizar el CV de entrada con el mismo procedimiento (`normalize_cv`) usado en entrenamiento.
- Idioma y dominio: solo inglés, centrado en roles de tecnología, producto, datos, diseño, marketing, ventas y operaciones, con localizaciones sesgadas hacia Europa.
- Debilidades conocidas: las ofertas de nivel "demasiado senior" suelen pasarse por alto; el gusto personal (sector, tipo de empresa) no está modelado; las ofertas de remoto solo para EE. UU. se marcan como "no elegible" para personas fuera de EE. UU., correcto para empleados pero no para contratistas freelance.
- La salida `location: no` no debería ocultar una oferta por sí sola salvo con alta confianza; la extensión de referencia solo oculta con P(no) ≥ 0,8 y muestra "unclear" en caso contrario.
- La cuantización a 4 bits degrada el F1 de verdict en 0,05 y no se publica; para máxima fidelidad hay que usar fp16.
- Licencia MIT sin restricciones comerciales, pero el aviso de uso ético anterior sigue aplicando.
- Métricas de un único run: las diferencias frente a Celer están dentro del ruido entre semillas, según los propios autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lacuna-ai/lacuna-altus
- Modelo destilado (Lacuna Celer): https://huggingface.co/lacuna-ai/lacuna-celer
- Modelo base (ModernBERT-large): https://huggingface.co/answerdotai/ModernBERT-large
- Repositorio con codigo, pipeline de entrenamiento y extension de Chrome: https://github.com/cucoleadan/lacuna-ai
