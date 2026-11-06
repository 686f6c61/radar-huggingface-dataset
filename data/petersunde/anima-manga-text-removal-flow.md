# petersunde/anima-manga-text-removal-flow

## Resumen

Anima manga text removal flow es un modelo experimental de inpainting especializado en la eliminación de texto sobre ilustraciones de estilo anime y manga. Lo desarrolla el usuario de Hugging Face petersunde como una adaptación del modelo base circlestone-labs/Anima, y se distribuye bajo la licencia propia del modelo original (anima-license). Su propósito concreto es recibir una imagen RGB con texto superpuesto junto a una máscara de edición y reconstruir la región enmascarada con el contenido visual subyacente, componiendo los píxeles fuera de la máscara de forma exacta en inferencia.

Técnicamente no es un modelo completo entrenado desde cero, sino un conjunto de adaptaciones sobre Anima-Base: un adaptador LLLite completo preentrenado, una rama de evidencia RGB observada, un LoRA de rango 16 sobre el transformer y los dos últimos bloques del transformer más la cabeza de salida. El VAE y el text encoder permanecen congelados durante el entrenamiento. El repositorio ocupa 28,5 GB y la publicación corresponde a una ejecución completa en el paso de optimizador 7260, que el propio autor describe explícitamente como un experimento y no como una garantía de calidad.

El modelo trabaja sobre recortes nativos de 512 píxeles y emplea flow matching de ruido limpio a gaussiano para el entrenamiento. Está pensado para flujos de limpieza de scans, páginas de manga y material de archivo donde el texto (rótulos, subtítulos, marcas de agua) debe eliminarse preservando el dibujo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptación de Anima-Base: LLLite completo, rama de evidencia RGB, LoRA de rango 16 sobre transformer y dos últimos bloques del transformer más cabeza de salida; VAE y text encoder congelados |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | anima-license (licencia propia de circlestone-labs/Anima) |
| Formato de pesos | safetensors (tres ficheros complementarios: adapter, lora y terminal) más training-state.pt |

## Arquitectura y entrenamiento

El modelo parte de Anima-Base y añade varias piezas entrenables sobre un backbone congelado. La adaptación incluye un LLLite completo preentrenado, una rama de evidencia RGB observada que aporta información de la imagen de entrada, un LoRA de rango 16 aplicado al transformer y los dos últimos bloques del transformer junto con la cabeza de salida. El VAE y el text encoder no se entrenan. La entrada es RGB corrompido más una máscara de edición, y el objetivo es la imagen RGB original.

El entrenamiento utiliza flow matching de ruido limpio a gaussiano con una pérdida MSE de velocidad normalizada por máscara, más un término MSE de 0,05 sobre la región conocida normalizado por separado; los ejemplos de identidad usan MSE de velocidad sobre la imagen completa. Se emplean recortes nativos de 512 píxeles con texto sintético generado al vuelo, incluyendo variantes estiradas, translúcidas, con contorno y con degradado. El soporte de resplandor (glow) se limita a 16 píxeles más allá de los glifos. El muestreo se realiza con arranque gaussiano, 30 pasos Euler, flow shift 3 y CFG 1, sin sampler de imagen inicial ni de ruido cero. El estado de entrenamiento se guarda en `training-state.pt` (adaptaciones, estado AdamW, estado RNG, huella de configuración y datos, paso de optimizador y siguiente presentación de datos) con `resume.json` que incluye su SHA-256.

## Capacidades

- Eliminación de texto sobre ilustraciones de anime y manga mediante inpainting condicionado por máscara.
- Reconstrucción de la región enmascarada con contenido visual coherente, componiendo los píxeles fuera de la máscara de forma exacta en inferencia.
- Manejo de texto sintético variado en entrenamiento: estirado, translúcido, con contorno y con degradado.
- Soporte limitado de resplandor alrededor de los glifos, hasta 16 píxeles.
- Procesamiento de recortes nativos de 512 píxeles.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Limpieza de scans de manga: eliminar rótulos, subtítulos y textos incrustados de páginas escaneadas para su posterior retraducción o maquetación, usando la máscara de edición sobre las regiones de texto.
- Restauración de material de archivo de ilustración anime: recuperar el dibujo original bajo marcas de agua o anotaciones, aprovechando que los píxeles fuera de la máscara se recomponen exactamente.
- Preprocesado para traducción de cómics: generar imágenes limpias de texto que sirvan de base a pipelines de lettering automatizado en otros idiomas.
- Preparación de datasets de ilustración: eliminar texto no deseado de imágenes de entrenamiento o de referencia antes de usarlas en otros modelos generativos.
- Limpieza de fondos y portadas: retirar títulos y créditos superpuestos en portadas de doujinshi o ilustraciones promocionales preservando el arte subyacente.
- Flujos de postproducción por lotes: integrar el modelo en scripts que procesen recortes de 512 píxeles con máscaras generadas automáticamente por un detector de texto OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas de evaluación sobre muestras retenidas con corrupciones y semillas fijas (métricas de color en CIE76 y PSNR, excluyendo píxeles conocidos), pero no se proporcionan valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica un sampler propio en `code/pilot/full_flow_sample.py` y la carga mediante `pilot.anima.load(adapter_path=..., lora_path=..., terminal_path=..., stream_gpu=True)`, que requiere la dependencia sd-scripts fijada y los assets base documentados en `code/pilot/anima_assets.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El muestreo usa 30 pasos Euler con CFG 1.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (inpainting especializado en eliminación de texto sobre anime) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El propio autor califica la publicación como un experimento sin garantía de calidad; corresponde a una única ejecución en el paso 7260.
- El soporte de resplandor alrededor del texto está limitado a 16 píxeles más allá de los glifos; textos con halos mayores pueden no eliminarse correctamente.
- El modelo trabaja sobre recortes nativos de 512 píxeles, lo que puede requerir trocear imágenes de mayor resolución.
- El sampler de referencia no admite arranque desde imagen ni ruido cero; debe usarse el sampler compatible documentado.
- La licencia anima-license es una licencia propia con términos específicos que deben revisarse antes de cualquier uso comercial; no es una licencia permisiva estándar.
- Los derechos del arte original y de la licencia de Anima siguen aplicando; el modelo no otorga una licencia general sobre las obras del dataset.
- Riesgo de alucinación visual: la región reconstruida puede no coincidir con el dibujo original en zonas de textura compleja, y PSNR no mide por sí solo la plausibilidad perceptiva.
- El camino rápido en GPU presenta no determinismo de coma flotante ordinario, aunque la equivalencia determinista de checkpoints se probó por separado.
- No se documentan idiomas soportados, sesgos conocidos ni comportamiento multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/petersunde/anima-manga-text-removal-flow
- Modelo base: https://huggingface.co/circlestone-labs/Anima
- Licencia del modelo base: https://huggingface.co/circlestone-labs/Anima/blob/main/LICENSE.md
- Dataset de entrenamiento: https://huggingface.co/datasets/petersunde/danbooru2023-animetext-clean
