# mlx-community/Unlimited-OCR-2-8bit

## Resumen

Unlimited-OCR-2-8bit es una versión cuantizada a 8 bits, para el framework MLX de Apple Silicon, del modelo de OCR baidu/Unlimited-OCR-2 desarrollado por Baidu. Se trata de un modelo de visión-lenguaje (image-text-to-text) especializado en el reconocimiento y parseo de documentos, con aproximadamente 3.340 millones de parámetros según los pesos en safetensors del repositorio. Su función principal es convertir páginas e imágenes de documentos en texto estructurado, incluyendo etiquetas de bloques con coordenadas y soporte para el parseo multipágina.

La relevancia de esta versión radica en su optimización para ejecutarse localmente en Mac con Apple Silicon mediante MLX: la cuantización afín a 8 bits (group size 64) aplicada al modelo de lenguaje reduce el consumo de memoria manteniendo las torres de visión (SAM y CLIP) y el router DASH en bfloat16. Esto permite realizar OCR de alta calidad sin depender de servicios en la nube, algo especialmente útil para flujos de trabajo con documentos sensibles.

El modelo incorpora innovaciones técnicas destacables como el RoPE 2D para páginas (page2d RoPE) y la atención bloque-esparsa DASH, así como un modo "gundam" que combina una vista global de 1024 píxeles con hasta 16 recortes locales por página para capturar tanto la estructura general como el detalle fino del texto. La salida estructurada con etiquetas `<PAGE>`, `<BLOCK>` y marcadores de continuidad entre páginas facilita la conversión posterior a Markdown.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model con torres de visión SAM y CLIP, router DASH por capa y atención bloque-esparsa |
| Parametros totales | 3.340.043.008 (3,34 B) |
| Parametros activos | no disponible (no consta que sea MoE, aunque incluye un router DASH por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine quantization (group size 64) en el modelo de lenguaje; SAM, CLIP y router DASH en bfloat16 |
| Idiomas soportados | multilingüe (lista concreta de idiomas no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo combina un modelo de lenguaje con dos torres de visión (SAM y CLIP) y un mecanismo de enrutamiento DASH por capa que habilita atención bloque-esparsa (block-sparse attention). Esta atención esparsa, junto con el RoPE 2D a nivel de página, permite procesar documentos de alta resolución de forma eficiente, atendiendo selectivamente a las regiones relevantes en lugar de a toda la imagen de manera densa. El modo "gundam" genera una vista global de 1024 píxeles más hasta 16 recortes locales por página, resolviendo el compromiso habitual entre contexto global del documento y resolución del texto.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada; debe consultarse la model card original de baidu/Unlimited-OCR-2. La versión aquí descrita es una conversión a MLX realizada por la comunidad mlx-community mediante mlx-vlm, cuantizando únicamente el modelo de lenguaje a 8 bits con tamaño de grupo 64 y preservando en bfloat16 los componentes de visión y el router, una práctica habitual para no degradar la calidad de extracción visual.

## Capacidades

- OCR y parseo de documentos: convierte imágenes de páginas en texto estructurado con etiquetas de bloques, coordenadas `[x0, y0, x1, y1]` y texto asociado.
- Parseo multipágina: acepta varias imágenes en una misma petición, con una vista base de 1024 píxeles por página, y marca los bloques que continúan entre páginas mediante etiquetas `cross_*` y `append_*`.
- Salida estructurada: formato `<PAGE>` y `<BLOCK>label[x0, y0, x1, y1]<FORK>text`, con convertidor a Markdown incluido en el repositorio original.
- Procesamiento de documentos de alta resolución gracias al modo "gundam" (vista global + hasta 16 recortes locales).
- Capacidades conversacionales propias de un modelo vision-language (pipeline image-text-to-text).
- Soporte multilingüe (idiomas concretos no especificados).
- No hay información disponible sobre tool calling, capacidades de agente, generación de código ni razonamiento matemático.

## Casos de uso

- Digitalización de archivos documentales: parseo masivo de documentos escaneados (contratos, facturas, informes) convirtiendo cada página a texto estructurado con coordenadas de bloques, lo que permite reconstruir el layout original.
- Conversión de PDF a Markdown: el formato de salida etiquetado y el convertidor a Markdown del repositorio permiten construir pipelines de ingesta de documentos para sistemas RAG.
- Procesamiento de documentos multipágina en una sola petición: útil para contratos o informes largos, ya que el modelo mantiene la continuidad de bloques entre páginas con las etiquetas `cross_*` y `append_*`.
- OCR local y privado en Mac: al ejecutarse con MLX en Apple Silicon, es adecuado para organizaciones que no pueden enviar documentos sensibles (médicos, legales, financieros) a APIs de terceros.
- Extracción de datos con localización: las coordenadas de cada bloque permiten resaltar visualmente el texto extraído sobre la imagen original, útil en herramientas de revisión y anotación.
- Preprocesamiento para entrenamiento de modelos: generación de corpus de texto alineado con layout a partir de colecciones de imágenes de documentos.
- Automatización de flujos de back-office: integración en scripts que reciben escaneos y producen texto estructurado para su validación o almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluaciones del modelo base, consulte la model card original de baidu/Unlimited-OCR-2.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 4,1 GB; con la cuantización a 8 bits del modelo de lenguaje y las torres de visión en bfloat16, se estima un consumo en torno a 5-6 GB de memoria unificada para inferencia, más la memoria necesaria para el KV cache según el número de páginas (estimación propia, no confirmada por el autor).
- Hardware recomendado: Mac con Apple Silicon (M1, M2, M3, M4). Al ser un modelo MLX, no está pensado para GPUs NVIDIA; no hay datos sobre requisitos en CUDA.
- Consumer hardware: debería funcionar en Macs de gama media con al menos 8-16 GB de memoria unificada, aunque no hay confirmación oficial del mínimo requerido.
- Despliegue: mediante mlx-vlm. Mientras el soporte de page2d RoPE y DASH se integra en la versión oficial, debe instalarse la rama específica: `pip install -U "git+https://github.com/shuuul/mlx-vlm.git"`. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Ejemplo de uso: `mlx_vlm.generate --model mlx-community/Unlimited-OCR-2-8bit --image page.png --prompt "Multi page parsing." --max-tokens 8192 --temperature 0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Especializacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| mlx-community/Unlimited-OCR-2-8bit | 3,34 B | 8-bit (LM) + bf16 (vision) | OCR y parseo de documentos | MIT | MLX (Apple Silicon) |
| baidu/Unlimited-OCR-2 (base) | no disponible | bfloat16 | OCR y parseo de documentos | MIT | PyTorch / transformers |
| PaddleOCR-VL / otros OCR-VL | no disponible | no disponible | OCR | no disponible | no disponible |

No se dispone de datos suficientes sobre alternativas comparables de tamaño y tarea similares para una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- La versión MLX requiere instalar mlx-vlm desde una rama específica hasta que el soporte de page2d RoPE y DASH se integre en la versión oficial, lo que introduce riesgo de inestabilidad.
- La cuantización a 8 bits puede degradar ligeramente la calidad respecto al modelo base en bfloat16, aunque las torres de visión se mantienen sin cuantizar.
- La lista concreta de idiomas soportados no está documentada en esta ficha; verificar en la model card original antes de usar en idiomas distintos del inglés.
- La longitud de contexto máxima no está especificada; el parseo multipágina con `--max-tokens 16384` sugiere salidas largas, pero los límites exactos deben confirmarse.
- Sesgos conocidos y tasas de alucinación: no disponibles; como en todo modelo de OCR, conviene validar la salida en documentos críticos.
- Aunque la licencia MIT permite uso comercial sin restricciones relevantes, la model card de esta conversión es mínima y remite a la del modelo base para detalles operativos.
- Al tratarse de una conversión comunitaria (583 descargas en el momento de los datos), el soporte y el mantenimiento dependen de la comunidad mlx-community.

## Enlaces

- Modelo cuantizado (MLX): https://huggingface.co/mlx-community/Unlimited-OCR-2-8bit
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Organización mlx-community: https://huggingface.co/mlx-community
- mlx-vlm (con soporte en rama): https://github.com/Blaizzy/mlx-vlm y https://github.com/shuuul/mlx-vlm.git
- Paper, blog oficial y demos: no disponibles en la informacion proporcionada.
