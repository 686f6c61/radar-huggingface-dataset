# nvidia/Nemotron-Labs-Image-30B-A3B

## Resumen

Nemotron-Labs-Image-30B-A3B es el componente de generación de imágenes raster del framework Nemotron-Labs-VisualCreation, desarrollado por NVIDIA. Se trata de un modelo autorregresivo de generación de imágenes a partir de texto que opera sobre tokens visuales discretos, bajo la filosofía "Pixel as Code": la apariencia raster y la estructura editable (SVG, HTML/CSS, programas de plotting, marcado de documentos) comparten una misma interfaz de generación y renderizado. El modelo se publica junto con su tokenizador visual empaquetado.

Con 32.634.904.896 parámetros totales según los pesos en safetensors (el nombre comercial indica 30B), el modelo emplea una arquitectura etiquetada como `nemotron_h` en Hugging Face y se distribuye en formato safetensors con código personalizado, requiriendo `transformers`. El repositorio ocupa 133,2 GB, lo que sugiere pesos en precisión alta (probablemente BF16) sin cuantizaciones publicadas.

Su relevancia actual radica en que no es un generador de imágenes aislado, sino la pieza raster de un sistema agéntico más amplio: el harness de VisualCreation enruta la petición, selecciona la familia de artefacto y el backend de renderizado, y usa evidencia renderizada (inspección visual y auditorías en navegador) para diagnosticar y reparar resultados. La licencia es la NVIDIA OneWay Noncommercial License, lo que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autorregresiva sobre tokens visuales discretos; etiqueta de arquitectura `nemotron_h` (transformer, detalles internos no disponibles) |
| Parámetros totales | 32.634.904.896 |
| Parámetros activos | no disponible (la nomenclatura A3B sugiere mezcla de expertos, pero no se confirma en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA OneWay Noncommercial License (nvidia-license) |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-to-image |
| Librería | transformers (con `custom_code`) |
| Tamaño del repositorio | 133,2 GB |
| Componentes incluidos | Generador de imágenes raster y tokenizador visual empaquetado |

## Arquitectura y entrenamiento

El modelo es un generador autorregresivo que representa la apariencia visual mediante tokens visuales discretos aprendidos, producidos por un tokenizador visual que se distribuye junto con el modelo. La generación se plantea como una secuencia de tokens visuales que después se decodifican a imagen raster. La model card no detalla el número de capas, dimensión oculta, mecanismo de atención ni si existe mezcla de expertos, pese a que el sufijo A3B del nombre sugiere parámetros activos reducidos; esta información no está disponible en el material proporcionado.

En cuanto al entrenamiento, la información disponible no especifica el volumen de tokens, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. Lo que sí se describe es el sistema en el que se integra: el harness de VisualCreation planifica el entregable (familia de artefacto, representación, backend de renderizado y política de activos), y para peticiones estructuradas o híbridas establece un contrato de layout. En el caso raster, la selección visual elige entre candidatos generados; en creación basada en navegador se usan comprobaciones del renderizador y auditorías visuales para asignar reparaciones dirigidas y conservar checkpoints del artefacto. La innovación destacable es, por tanto, la interfaz "Pixel as Code" que unifica tokens visuales aprendidos y programas explícitos, más el bucle de verificación sobre evidencia renderizada.

## Capacidades

- Generación de imágenes raster a partir de descripciones textuales, incluyendo infografías ilustradas, composiciones con texto denso, retratos, tipografía estilizada e imágenes de producto.
- Producción de artefactos visuales editables dentro del framework: páginas web, presentaciones, documentos, gráficos y figuras científicas, mediante SVG, HTML/CSS, programas de plotting y marcado de documentos.
- Creación de artefactos híbridos que combinan imágenes generadas con estructura explícita (texto, geometría y layout editables).
- Planificación del entregable: enrutado a familia de artefacto, representación y backend de renderizado, con contrato de layout para peticiones estructuradas.
- Selección visual entre candidatos raster generados.
- Auditoría y reparación guiada: diagnóstico de problemas mediante comprobaciones del renderizador y auditorías visuales, con asignación de reparaciones específicas.
- Soporte de múltiples resoluciones en la generación (la galería publica conjuntos de resoluciones junto a los prompts originales).
- No se documentan en la información disponible capacidades de tool calling genérico, razonamiento multi-paso en texto, audio ni visión de entrada.

## Casos de uso

- Generación de infografías para marketing y prensa: el modelo produce composiciones raster con texto integrado, útiles para piezas divulgativas donde se necesita control tipográfico dentro de la imagen; la galería oficial permite evaluar calidad por resolución antes de integrarlo.
- Ilustración de artículos y documentación técnica: generación de figuras y diagramas raster que después pueden combinarse con estructura editable en el flujo híbrido del framework, de modo que el texto y las etiquetas permanezcan corregibles.
- Creación de imágenes de producto para catálogos: el modelo está entrenado para imaginar producto y bodegón; encaja en pipelines de previsualización de catálogo antes de la fotografía final, con revisión humana obligatoria por el riesgo de artefactos.
- Prototipado de páginas web y presentaciones: dentro de VisualCreation, el mismo sistema genera artefactos HTML/CSS y de presentación, lo que permite pasar de un brief a un borrador renderizado y auditar el resultado en navegador antes de entregarlo a diseño.
- Figuras científicas y gráficos: la ruta de plotting y figuras del framework permite generar representaciones visuales de datos con estructura editable, adecuadas para publicaciones donde la figura debe poder ajustarse después.
- Retratos y tipografía estilizada para campañas: generación de piezas raster con estética controlada por prompt, útil para exploración creativa por lotes con selección visual entre candidatos.
- Automatización de activos visuales en flujos agénticos: el bucle de generación, renderizado e inspección permite que un agente produzca un artefacto, lo audite y lo repare sin intervención manual, siempre que el uso encaje en la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia secciones de resultados y varios arXiv (2610.38095, 2606.15007, 2606.02800, 2503.15558, 2611.31358) y un PDF del paper en el repositorio, pero no se incluyen cifras en el material proporcionado, por lo que no se reproducen números.

## Requisitos de hardware

- VRAM estimada para inferencia: con 32.634.904.896 parámetros, en BF16 se requieren aproximadamente 65 GB solo para pesos, más overhead de activaciones y del tokenizador visual; no se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: para BF16 en un solo dispositivo, GPUs de 80 GB (A100 80GB, H100 80GB) o superiores; el tamaño del repositorio (133,2 GB) sugiere que la descarga incluye más de una precisión o componentes adicionales.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en BF16 sin cuantización; no se han publicado pesos GGUF ni cuantizados, por lo que no se puede confirmar un despliegue viable en consumer.
- Opciones de despliegue: la librería indicada es `transformers` con `custom_code`, lo que obliga a cargar código del repositorio con `trust_remote_code`. No se confirma soporte de vLLM, TGI, llama.cpp ni Ollama para esta tarea de generación de imágenes.
- Latencia y throughput: no disponibles. Al ser generación autorregresiva sobre tokens visuales, la latencia escala con el número de tokens de imagen y la resolución; no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de modelos de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo estructural:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Nemotron-Labs-Image-30B-A3B | 32,6 B | no disponible | NVIDIA OneWay Noncommercial | Generación raster autorregresiva sobre tokens visuales, integrada en framework agéntico |
| Alternativas de text-to-image de gran escala | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: NVIDIA OneWay Noncommercial License limita el uso comercial; cualquier despliegue en producto requiere revisión legal y, previsiblemente, licencia aparte.
- Riesgo de alucinación visual: como generador autorregresivo, puede producir texto ilegible dentro de la imagen, geometrías inconsistentes o detalles falsos; el propio framework incorpora auditoría visual precisamente por este motivo.
- Sin datos publicados de sesgos: la información disponible no documenta evaluaciones de sesgo demográfico, estético o cultural; se recomienda auditoría propia antes de usar en contenido público.
- Idiomas no declarados: no se especifican idiomas soportados, lo que afecta especialmente a la generación de texto dentro de imagen en castellano.
- Contexto y cuantizaciones no disponibles: no se puede planificar el despliegue en función de la ventana de contexto ni existen pesos cuantizados oficiales.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y añade superficie de riesgo en producción.
- Requisitos de memoria elevados: ~65 GB en BF16 para pesos, lo que excluye GPUs de consumo sin cuantización no publicada.
- Naturaleza de componente: es la pieza raster de un framework mayor; usarlo de forma aislada pierde las ventajas de planificación, renderizado y auditoría del harness.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Paper (PDF en el repositorio): https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B/resolve/main/paper.pdf
- Galería de VisualCreation: https://fuxiaoliu-nemotron-labs-visualcreation-gallery.static.hf.space/index.html
- Galería de generación de imágenes: https://fuxiaoliu-nemotron-labs-visualcreation-gallery.static.hf.space/image-generation/index.html
- Licencia NVIDIA OneWay Noncommercial: https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- arXiv 2610.38095: https://arxiv.org/abs/2610.38095
- arXiv 2606.15007: https://arxiv.org/abs/2606.15007
- arXiv 2606.02800: https://arxiv.org/abs/2606.02800
- arXiv 2503.15558: https://arxiv.org/abs/2503.15558
- arXiv 2611.31358: https://arxiv.org/abs/2611.31358
