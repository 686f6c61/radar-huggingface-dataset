# HikariDawn/CodecOPSD-H3-Ref2VA

## Resumen

CodecOPSD-H3-Ref2VA es un adaptador LoRA desarrollado por HikariDawn que se aplica sobre el modelo base MiniMaxAI/MiniMax-H3 Ref2VA para acelerar la generación de vídeo a partir de referencias (reference-to-video). El problema que aborda es el coste computacional creciente de los generadores secuenciales: cada imagen o vídeo de referencia se anexa a la secuencia de tokens de entrada, de modo que el coste crece abruptamente al añadir condiciones. CodecOPSD propone podar los tokens de condición redundantes mediante un códec de vídeo y entrenar un LoRA pequeño sobre los tokens conservados mediante autodestilación on-policy.

El resultado declarado por el autor es una reducción media de en torno al 70% de los tokens de condición en MiniMax-H3 Ref2VA con calidad prácticamente inalterada y un desenfoque (denoising) 1,87 veces más rápido, llegando hasta 8,4 veces en escenarios con más condiciones (tres vídeos de referencia, referencias de mayor resolución, más fotogramas y mayor tasa de descarte). En MiniMax-H3-Image la poda alcanza el 65% de los tokens de referencia con un denoising aproximadamente 2 veces más rápido.

El repositorio ocupa 8,2 GB y contiene únicamente los pesos del adaptador, no el modelo base. Está etiquetado como `image-text-to-video`, con idioma inglés y licencia `minimax-h3-community-license-agreement`. Es relevante ahora porque ataca el cuello de botella práctico de los modelos de vídeo con múltiples referencias: el coste de tokens de condición, sin requerir reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter) sobre MiniMax-H3 Ref2VA; poda de tokens de condición mediante códec de vídeo + autodestilación on-policy |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | no disponible (repo de 8,2 GB; pesos del adaptador) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo. La innovación central es CodecOPSD: un códec de vídeo que identifica y descarta tokens de condición redundantes en generadores secuenciales como MiniMax-H3 Ref2VA, y un LoRA pequeño entrenado sobre los tokens conservados mediante autodestilación on-policy. El modelo base es MiniMaxAI/MiniMax-H3, un generador secuencial que anexa cada referencia (imagen o vídeo) a la secuencia de entrada, lo que provoca un crecimiento del coste de tokens al aumentar las condiciones.

El autor reporta que la poda elimina en torno al 70% de los tokens de condición con calidad casi inalterada y un denoising 1,87 veces más rápido, alcanzando hasta 8,4 veces con tres vídeos de referencia, referencias de mayor resolución, más fotogramas y mayor tasa de descarte. En el cortometraje de ejemplo, una generación de 768 x 1344 y 737 fotogramas pasó de 279.552 a 90.396 tokens (−68%) con 348,0 s de denoising en una B200. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de referencias (reference-to-video) sobre MiniMax-H3 Ref2VA.
- Podado de tokens de condición redundantes con un códec de vídeo, reduciendo el coste de cómputo del denoising.
- Aceleración del denoising de forma proporcional al número y tamaño de las condiciones.
- Manejo de múltiples referencias: identidad (vistas frontal y trasera), escenas y fotogramas de inicio y fin, según el ejemplo del cortometraje.
- Generación con audio en el ejemplo mostrado (el cortometraje incluye audio).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multilingüe ni visión más allá de la propia generación de vídeo.

## Casos de uso

- Producción de cortometrajes con personajes recurrentes: el adaptador permite mantener la identidad de un personaje (mech frontal, trasero, monstruo) a lo largo de varias generaciones con una reducción de tokens del 53-65%, lo que abarata generar secuencias largas por partes.
- Prototipado rápido de vídeo con múltiples referencias: al reducir el coste de tokens, se pueden iterar más generaciones con tres vídeos de referencia en el mismo presupuesto de cómputo, con hasta 8,4 veces menos tiempo de denoising.
- Generación a alta resolución y muchos fotogramas: el ejemplo de 768 x 1344 y 737 fotogramas con 348,0 s en una B200 muestra su utilidad para clips largos de alta resolución.
- Integración en pipelines de creación de contenido con greybox: el ejemplo usa vídeo greybox más imágenes como referencia, lo que encaja en flujos de previsualización y animación.
- Investigación sobre eficiencia en generación de vídeo: sirve como referencia reproducible para estudiar poda de tokens de condición y destilación on-policy en generadores secuenciales.
- Despliegue en entornos con GPU limitadas: al recortar tokens de condición, se reduce el tiempo de denoising y se hace viable generar con referencias múltiples donde el modelo base resultaría demasiado costoso.

## Benchmarks y rendimiento

| Escenario | Base / referencia | Resultado con CodecOPSD |
|---|---|---|
| MiniMax-H3 Ref2VA (media) | — | ~70% de tokens de condición eliminados, calidad casi inalterada, denoising 1,87x más rápido |
| MiniMax-H3 Ref2VA (más condiciones) | — | hasta 8,4x más rápido (tres vídeos de referencia, mayor resolución, más fotogramas, mayor tasa de descarte) |
| MiniMax-H3-Image | — | ~65% de tokens de referencia eliminados, denoising ~2x más rápido |
| Cortometraje, 768 x 1344, 737 fotogramas | 279.552 tokens | 90.396 tokens (−68%), 348,0 s de denoising en 1x B200 |
| Parte 1, 141 fotogramas | 53,6k tokens | 18,9k tokens (−65%), 67,1 s |
| Parte 2, 175 fotogramas | 64,9k tokens | 18,3k tokens (−72%), 82,1 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador pesa 8,2 GB, pero requiere cargar el modelo base MiniMax-H3 Ref2VA, cuyo consumo no se detalla.
- GPU recomendadas: el ejemplo del autor se ejecutó en 1x B200; no se documentan otras GPU.
- ¿Cabe en GPU consumer? No disponible en la información proporcionada.
- Opciones de despliegue: no disponible; la librería indicada es `minimax-h3` y existe un Space de demostración.
- Latencia y throughput: 348,0 s de denoising para 737 fotogramas a 768 x 1344 en una B200; 67,1 s para 141 fotogramas y 82,1 s para 175 fotogramas en el cortometraje.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto / tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodecOPSD-H3-Ref2VA | LoRA sobre MiniMax-H3 Ref2VA | Reference-to-video | Poda ~70% de tokens de condición | minimax-h3-community-license-agreement | Hugging Face (este repo) |
| CodecOPSD-H3-Image | LoRA sobre MiniMax-H3-Image | Reference-to-image | Poda ~65% de tokens de referencia | no disponible | Hugging Face (repo del autor) |
| MiniMax-H3 Ref2VA (base) | Modelo completo | Reference-to-video | Secuencia completa de referencias | no disponible | Hugging Face (MiniMaxAI) |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA: requiere el modelo base MiniMax-H3 Ref2VA para funcionar; no es autónomo.
- Solo se declara soporte de inglés (`en`).
- Licencia `minimax-h3-community-license-agreement`: hay que revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar.
- La calidad se describe como "casi inalterada", pero la poda agresiva de tokens de condición puede degradar detalles en escenarios con muchas referencias o alta tasa de descarte; no se aportan métricas objetivas de calidad.
- No se documentan sesgos, riesgo de alucinación visual ni limitaciones de contexto en la información disponible.
- No se detallan requisitos mínimos de hardware ni opciones de cuantización, lo que dificulta planificar el despliegue.
- El repositorio se actualizó por última vez el 2026-11-28; conviene verificar la vigencia del adaptador respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/HikariDawn/CodecOPSD-H3-Ref2VA
- GitHub: https://github.com/Kiteretsu77/CodecOPSD
- Página del proyecto: https://kiteretsu77.github.io/CodecOPSD_website/
- Paper (arXiv): https://arxiv.org/abs/2611.31184
- Demo (Space): https://huggingface.co/spaces/HikariDawn/CodecOPSD-H3-Ref2VA
- Colección de modelos: https://huggingface.co/collections/HikariDawn/codecopsdopsd-6b04b49f98f5b4b68c5f7f9a
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Variante de imagen: https://huggingface.co/HikariDawn/CodecOPSD-H3-Image
