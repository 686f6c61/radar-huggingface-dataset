# mohsenvand/mindview-painter

## Resumen

mindview-painter es el componente "pintor" del proyecto mindview: un empaquetado de pesos preparado específicamente para su ejecución en navegador mediante WebGPU. No se trata de pesos nuevos de uso general, sino de una disposición binaria de pesos existentes más dos piezas pequeñas entrenadas específicamente para mindview: un adaptador ternario que sustituye al codificador de texto y una lente de visualización por bloque. Lo publica el autor del proyecto, Neo Mohsenvand (usuario mohsenvand), bajo licencia Apache 2.0.

El núcleo generativo es el transformador de difusión (DiT) de Bonsai Image 4B, que a su vez es FLUX.2 [klein] 4B de Black Forest Labs con sus pesos convertidos a ternario. El modelo empaquetado incluye ese DiT repackado, un adaptador lineal ternario, el decodificador latente TAEF2 y varios ficheros auxiliares de horarios y visualización. El repositorio ocupa 1,1 GB.

Su relevancia es acotada y muy específica: demuestra un pipeline de generación de imagen texto-a-imagen cuantizado en ternario (2 bits por peso empaquetado) capaz de ejecutarse en el navegador, con un esquema de muestreo por defecto de 4 pasos. Es material del sitio neovand.github.io/mindview y no se presenta como un modelo de propósito general. A fecha de creación del repositorio (26-09-2026) registra 0 descargas y 0 "likes".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) ternario derivado de FLUX.2 [klein] 4B; adaptador lineal ternario; decodificador latente TAEF2 |
| Parámetros totales | no disponible con cifra exacta; el DiT corresponde a Bonsai Image 4B (~4.000 millones) y el adaptador es de tamaño reducido; el lector de 1,7B no se incluye |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generación de imagen, no de texto) |
| Tipos de cuantización | ternaria: 16 códigos de 2 bits por cada u32 más una escala f32 por cada 128 entradas; el resto de tensores, en denso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (painter, adaptador y lente); TAEF2 bajo MIT |
| Formato de pesos | binario propio: manifest.json + dit_0.bin…dit_4.bin, dit_misc.bin, adapter.bin, taef2.bin, schedules.bin, viz.bin; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se compone de varios ficheros con funciones separadas. El bloque principal es el DiT de Bonsai Image 4B, repackado desde `prism-ml/bonsai-image-ternary-4B-unpacked@30bbc03`, que a su vez es FLUX.2 [klein] 4B de Black Forest Labs con pesos ternarios. Los tensores ternarios se almacenan como 16 códigos de 2 bits por u32 más una escala f32 por cada 128 entradas de entrada, mientras que el resto de tensores permanece en denso. El embedding de timestep no se incluye: sus salidas (la modulación de cada paso de los horarios) se precalculan en los campos `mod.*` y se verifican contra float64. El export se validó de forma que cada peso ternario fuese exacto, según `export_report.json`.

En lugar del codificador de texto original, el pipeline usa `adapter.bin`, un adaptador lineal ternario entrenado para mindview que proyecta los estados del lector Ternary Bonsai 1,7B en las capas 7, 14 y 21 al condicionamiento textual de 7.680 dimensiones del DiT. La decodificación latente la realiza TAEF2, un decodificador latente pequeño de Ollin Boer Bohan, repackado sin cambios (MIT). Los ficheros `schedules.bin`/`schedules.json` contienen los niveles de ruido y la modulación de timestep para distintos recuentos de pasos, con un horario por defecto de 4 pasos. `viz.bin`/`viz.json` contienen una lente ajustada por bloque (una lectura lineal de la imagen que el DiT "tiene en mente" tras cada bloque) más sondas de color para las etapas del decodificador, solo para visualización. No se detallan datos de entrenamiento del adaptador ni de la lente, ni volúmenes de tokens o composición de dataset. El runtime de navegador que lee estos ficheros coincide bloque a bloque con la referencia en PyTorch.

## Capacidades

- Generación de imágenes a partir de texto (pipeline declarado: text-to-image).
- Condicionamiento textual indirecto: el adaptador traduce estados de un modelo lector de 1,7B al espacio de condicionamiento del DiT, en sustitución del codificador de texto original.
- Muestreo con horario de 4 pasos por defecto, con horarios adicionales para otros recuentos de pasos.
- Decodificación latente mediante TAEF2.
- Ejecución en navegador mediante WebGPU.
- Visualización e introspección: lente por bloque sobre la representación interna del DiT y sondas de color de las etapas del decodificador (uso exclusivamente de visualización).
- No se documentan capacidades de tool calling, function calling ni agentes.
- No se documentan capacidades multilingües ni de visión de entrada, audio o modo de razonamiento.

## Casos de uso

- Generación de imágenes en el navegador sin backend: el pipeline está empaquetado para WebGPU, de modo que el usuario puede generar imágenes localmente en el cliente sin subir datos a un servidor.
- Demostración interactiva en web: el repositorio es lo que descarga neovand.github.io/mindview, por lo que sirve como base de una demo pública de generación de imagen en el navegador.
- Aplicaciones de borde u offline: al usar pesos ternarios y un repo de 1,1 GB, encaja en escenarios con poco almacenamiento y memoria disponible, incluidos dispositivos de consumo.
- Investigación en cuantización ternaria de DiT: al conservar los pesos ternarios exactos y ofrecer un informe de export, permite reproducir y auditar el efecto de la cuantización ternaria sobre FLUX.2 [klein] 4B.
- Interpretabilidad de modelos de difusión: la lente por bloque y las sondas de color permiten estudiar qué representación construye el DiT en cada etapa y cómo se materializa en el decodificador.
- Reproducción en investigación con PyTorch: como el runtime de navegador coincide bloque a bloque con la referencia, sirve para validar portes entre implementaciones.
- Desarrollo de interfaces de IA generativa ligeras: prototipar editores o herramientas creativas que generan imágenes de forma local, sin depender de API externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 1,1 GB, incluyendo DiT, adaptador, TAEF2, horarios y ficheros de visualización.
- VRAM estimada para inferencia: no publicada. Como referencia, el peso ternario del DiT de ~4B implica del orden de 1 GB para los pesos más las escalas, por lo que la huella total del pintor es reducida; el requisito real depende de las activaciones y del ancho del batch (estimación propia, no confirmada por el autor).
- GPU recomendadas: no indicadas por el autor. El diseño para WebGPU apunta a GPU de consumo y a gráficas integradas compatibles con WebGPU; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el diseño para navegador y el tamaño del empaquetado; sin cifras oficiales.
- Opciones de despliegue: runtime de navegador de mindview sobre WebGPU (el que consume estos ficheros), y una referencia en PyTorch que coincide bloque a bloque. No se contemplan vLLM, TGI ni Ollama para el pintor; el lector Ternary Bonsai 1,7B se descarga aparte desde el repositorio de PrismML y se distribuye en formato GGUF.
- Latencia y throughput: con 4 pasos de muestreo por defecto, el coste es bajo en número de iteraciones, pero no se publican cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| mindview-painter (este) | DiT ~4B + adaptador + TAEF2 (cifra exacta no disponible) | ternaria (2 bits + escalas) | Apache 2.0, con TAEF2 bajo MIT | HF (mohsenvand/mindview-painter), 0 descargas |
| Bonsai Image 4B (prism-ml/bonsai-image-ternary-4B-unpacked) | ~4B (DiT) | ternaria | Apache 2.0 | HF, origen del DiT aquí empleado |
| FLUX.2 [klein] 4B (black-forest-labs) | ~4B | densa (original) | Apache 2.0 | HF, modelo base original |
| Ternary Bonsai 1,7B (prism-ml) | 1,7B | ternaria | Apache 2.0 | HF en GGUF, lector usado pero no incluido |

## Limitaciones y advertencias

- No es un modelo autónomo: solo cubre la mitad "pintora" del pipeline. El lector (Ternary Bonsai 1,7B) no está incluido y debe descargarse por separado del repositorio de PrismML.
- Dependencia de un runtime concreto: los ficheros están escritos para el runtime de navegador de mindview, que coincide con la referencia en PyTorch bloque a bloque; usarlos fuera de ese entorno requiere reimplementar la carga del layout binario.
- Ausencia de benchmarks: no hay resultados publicados que cuantifiquen la pérdida de calidad de la cuantización ternaria frente a FLUX.2 [klein] 4B original.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta.
- Licencias mixtas: el painter, el adaptador y la lente son Apache 2.0, pero TAEF2 se distribuye bajo MIT (repackado sin cambios); conviene revisar ambas al reutilizar componentes.
- Sesgos: no documentados. Al derivar de FLUX.2 [klein] 4B, hereda los sesgos del modelo original, no descritos en la model card.
- Riesgo de artefactos visuales: inherente a la generación por difusión, no cuantificado para este empaquetado y potencialmente agravado por la cuantización ternaria.
- Idiomas soportados: no especificados. Las capacidades lingüísticas del condicionamiento dependen del lector de 1,7B, del que no se documenta cobertura de idiomas.
- No es un modelo de lenguaje: no genera texto, no hace tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohsenvand/mindview-painter
- Repositorio del proyecto mindview: https://github.com/NeoVand/mindview
- Demo en navegador: https://neovand.github.io/mindview/
- Perfil del autor en GitHub: https://github.com/NeoVand
- Página personal del autor: https://neovand.github.io/
- Ficha del autor en MIT Media Lab: https://www.media.mit.edu/people/mmv/overview/
- Perfil del autor en ResearchGate: https://www.researchgate.net/profile/Neo-Mohsenvand
- DiT de origen (Bonsai Image 4B, PrismML): https://huggingface.co/prism-ml/bonsai-image-ternary-4B-unpacked
- Lector (Ternary Bonsai 1,7B, PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-gguf
- Decodificador TAEF2 (Ollin Boer Bohan): https://huggingface.co/madebyollin/taef2
- Modelo base original FLUX.2 [klein] 4B (Black Forest Labs): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
