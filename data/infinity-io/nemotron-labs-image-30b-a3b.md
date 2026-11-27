# Infinity-io/Nemotron-Labs-Image-30B-A3B

## Resumen

Nemotron-Labs-Image-30B-A3B es el componente de generación de imágenes raster del framework Nemotron-Labs-VisualCreation, un sistema agéntico orientado a la creación visual que unifica tokens visuales aprendidos con programas explícitos (SVG, HTML/CSS, código de plotting y marcado documental) bajo la interfaz denominada "Pixel as Code". Lo desarrolla NVIDIA dentro de su familia Nemotron Labs y se distribuye en Hugging Face a través del repositorio de Infinity-io. El modelo resuelve la generación de imágenes raster expresivas dentro de un pipeline más amplio que también produce artefactos editables como páginas web, presentaciones, documentos, gráficos y figuras científicas.

Arquitectónicamente se etiqueta como `nemotron_h` y se publica con pesos en safetensors y código personalizado (`custom_code`), con 32.634.904.896 parámetros totales según los metadatos del repositorio (el nombre comercial indica 30B y una estructura MoE con aproximadamente 3B de parámetros activos, aunque el número exacto de parámetros activos no se detalla en la información disponible). El repositorio ocupa 133,2 GB, lo que es coherente con un modelo de ese tamaño en precisión nativa.

Su relevancia actual radica en el enfoque híbrido: en lugar de limitarse a la síntesis de píxeles, el framework enruta cada petición hacia la familia de artefacto adecuada, emplea evidencia renderizada para seleccionar y auditar resultados y permite combinar imágenes generadas con estructura explícita editable. La licencia es la NVIDIA OneWay Noncommercial License, lo que condiciona fuertemente su uso en producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (`nemotron_h`), generación autorregresiva de tokens visuales |
| Parametros totales | 32.634.904.896 |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmación en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA OneWay Noncommercial License (nvidia-license) |
| Formato de pesos | safetensors (con `custom_code` en transformers) |

## Arquitectura y entrenamiento

El modelo es el generador de imágenes raster del framework VisualCreation y se apoya en un tokenizador visual empaquetado junto con los pesos. La generación es autorregresiva sobre tokens visuales discretos: la apariencia raster se representa mediante tokens aprendidos, mientras que la estructura y el layout se expresan mediante programas explícitos (SVG, HTML/CSS, plotting, marcado de documentos). El framework completo añade una capa de enrutamiento que decide la familia de artefacto, la representación y el backend de renderizado, además de auditorías visuales basadas en navegador para diagnosticar y reparar artefactos estructurados.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones de decodificación como decodificación especulativa o atención lineal más allá de la etiqueta arquitectónica `nemotron_h`. La model card referencia varios artículos (arXiv:2610.38095, 2606.15007, 2606.02800, 2503.15558 y 2611.31358) que presumiblemente contienen los detalles técnicos, pero su contenido no se incluye en la información proporcionada.

## Capacidades

- Generación de imágenes raster de alta expresividad: infografías ilustradas, composiciones con texto, retratos, tipografía estilizada e imágenes de producto.
- Generación de artefactos visuales editables dentro del framework: páginas web, presentaciones, documentos, gráficos y figuras científicas (componente de código estructurado del sistema, no solo el modelo de imagen).
- Artefactos híbridos que combinan imágenes generadas con estructura explícita (SVG, HTML/CSS) para permitir edición posterior.
- Selección visual entre candidatos raster mediante evidencia renderizada.
- Auditoría y reparación dirigida de artefactos estructurados mediante comprobaciones de renderizado en navegador y checkpoints de artefacto.
- Enrutamiento automático de la petición hacia la familia de artefacto, representación, backend de renderizado y política de activos.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes multi-paso: el framework se describe como agéntico (generación, renderizado e inspección), pero el modelo de imagen por sí solo no documenta capacidades de agente.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de infografías para marketing: el modelo produce composiciones raster con texto integrado, adecuadas para campañas donde se requiere una imagen final sin edición posterior y se acepta el coste de un modelo de 30B.
- Creación de material visual para presentaciones: dentro del framework, las peticiones de presentaciones se enrutan hacia el artefacto adecuado y el generador raster aporta las imágenes de apoyo, auditable mediante renderizado.
- Ilustración de documentación técnica y figuras científicas: el sistema combina plotting y marcado estructurado con imágenes raster para figuras que requieren tanto precisión geométrica como apariencia visual.
- Prototipado rápido de páginas web con activos visuales: el enrutador selecciona HTML/CSS como estructura y el generador raster produce los activos de imagen, con auditoría visual basada en navegador para detectar problemas de layout.
- Generación de imágenes de producto para catálogos internos: útil en flujos de exploración de concepto donde se necesita variar composición y estilo antes de una producción fotográfica real.
- Tipografía y cartelería estilizada: el modelo cubre composiciones con texto y tipografía decorativa, apropiadas para pruebas de concepto de identidad visual.
- Investigación en generación visual agéntica: el framework completo sirve como banco de pruebas para estudiar enrutamiento, selección visual y reparación dirigida por renderizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección "Results" y varios artículos arXiv, pero las cifras concretas no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 32.634.904.896 parámetros, en FP16 se requieren aproximadamente 65 GB solo para pesos, más overhead de activaciones y KV cache; en BF16 el orden de magnitud es el mismo.
- Cuantización: no se documentan tipos soportados. A falta de confirmación, una cuantización a 8 bits situaría los pesos en torno a 32 GB y a 4 bits en torno a 16 GB, pero son estimaciones teóricas, no cifras oficiales.
- GPU recomendadas: para FP16/BF16 se necesita al menos una A100 80 GB o H100; configuraciones multi-GPU con tensor parallelism son previsibles dado el tamaño.
- GPU de consumo: no cabe en GPUs de consumo en precisión nativa. En cuantizaciones agresivas podría aproximarse a una RTX 4090 de 24 GB, pero no hay soporte documentado.
- Opciones de despliegue: la librería indicada es transformers con `custom_code`, por lo que se requiere `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs-Image-30B-A3B | 32,6B totales (activos no disponibles) | no disponible | Generación de imagen autorregresiva sobre tokens visuales | NVIDIA OneWay Noncommercial | Hugging Face (repo Infinity-io) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generadores de imagen autorregresivos basados en tokens visuales con arquitectura MoE de ~30B) en los datos proporcionados, por lo que la comparativa cuantitativa no puede elaborarse.

## Limitaciones y advertencias

- Licencia no comercial: la NVIDIA OneWay Noncommercial License restringe el uso comercial. Cualquier despliegue en producción con fines lucrativos requiere revisión legal y, previsiblemente, una licencia comercial de NVIDIA.
- El modelo es solo un componente: la generación de artefactos estructurados (web, presentaciones, documentos) depende del harness completo del framework, no únicamente de estos pesos.
- Riesgo de alucinación visual: como generador autorregresivo de tokens, puede producir texto ilegible, geometrías inconsistentes o detalles incoherentes en composiciones complejas; el framework mitiga parte de esto con auditoría renderizada, pero el modelo aislado no la incluye.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; cabe esperar los sesgos típicos de los datos de entrenamiento visual (representación demográfica, estereotipos estilísticos).
- Idiomas: no se especifican idiomas soportados, lo que impide garantizar calidad en texto renderizado en castellano u otras lenguas.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar prompts largos o generaciones de alta resolución que requieran muchas iteraciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario inexistentes; la depuración recae enteramente en el usuario.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio y añade superficie de riesgo en entornos de producción.
- No se documentan cuantizaciones oficiales: desplegar en hardware limitado exige trabajo de conversión propio y validación de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinity-io/Nemotron-Labs-Image-30B-A3B
- Repositorio original de NVIDIA: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Paper (PDF alojado en el repo): https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B/resolve/main/paper.pdf
- Galería VisualCreation: https://fuxiaoliu-nemotron-labs-visualcreation-gallery.static.hf.space/index.html
- Galería de generación de imágenes: https://fuxiaoliu-nemotron-labs-visualcreation-gallery.static.hf.space/image-generation/index.html
- Licencia NVIDIA OneWay Noncommercial: https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- arXiv:2610.38095: https://arxiv.org/abs/2610.38095
- arXiv:2606.15007: https://arxiv.org/abs/2606.15007
- arXiv:2606.02800: https://arxiv.org/abs/2606.02800
- arXiv:2503.15558: https://arxiv.org/abs/2503.15558
- arXiv:2611.31358: https://arxiv.org/abs/2611.31358
