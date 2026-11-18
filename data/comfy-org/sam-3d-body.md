# Comfy-Org/sam-3d-body

## Resumen

SAM 3D Body es un modelo de estimación de malla corporal humana en 3D (human mesh recovery) desarrollado originalmente por Meta (Facebook) y empaquetado para ComfyUI por Comfy-Org. A diferencia de los modelos de lenguaje, este modelo resuelve un problema de visión por computador: a partir de imágenes o vídeo, reconstruye la geometría tridimensional del cuerpo humano, incluyendo pose, forma y posición en el espacio. El repositorio `Comfy-Org/sam-3d-body` es una redistribución de los pesos originales de `facebook/sam-3d-body-dinov3` en formato compatible con el nodo de detección de ComfyUI.

La relevancia actual del modelo radica en su integración en flujos de trabajo de generación y edición de vídeo dentro de ComfyUI: permite extraer mallas 3D de sujetos en vídeo para tareas de seguimiento, transferencia de movimiento, control de pose o composición 3D. El repositorio empaquetado incluye dos variantes de pesos (bf16 e int8 con rotación de canales) para equilibrar precisión y consumo de memoria.

La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa en los materiales proporcionados; la model card del empaquetado se limita a indicar la ubicación de los ficheros y el workflow asociado. El tamaño del repositorio es de 7,7 GB y acumula 47.236 descargas y 33 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `facebook/sam-3d-body-dinov3`, con backbone DINOv3 según el nombre) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | bf16 e int8 (con rotación de canales, `convrot`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | SAM License (`sam-license`), enlazada al LICENSE del modelo original de Meta |
| Formato de pesos | safetensors (`sam_3d_body_dinov3_bf16.safetensors`, `sam_3d_body_dinov3_int8_convrot.safetensors`) |

## Arquitectura y entrenamiento

El nombre del modelo base (`sam-3d-body-dinov3`) sugiere el uso de un backbone DINOv3 para la extracción de características visuales, sobre el que se construye un cabezal de regresión de parámetros de cuerpo 3D. No se dispone en la información proporcionada de detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si se aplicaron técnicas de ajuste fino con supervisión humana o preferencias.

El empaquetado de Comfy-Org no modifica la arquitectura: se limita a convertir y distribuir los pesos en safetensors, en dos precisiones (bf16 e int8 con rotación de canales), e integrarlos en el nodo de detección de ComfyUI. La variante int8 con rotación de canales es una técnica de cuantización que reduce el error de redondeo redistribuyendo la escala entre canales, lo que permite menor huella de memoria con una degradación controlada de la precisión.

## Capacidades

- Reconstrucción de malla corporal humana 3D a partir de imágenes o vídeo.
- Extracción de parámetros de pose y forma del cuerpo (estimación de articulaciones y silueta 3D).
- Procesamiento de vídeo para seguimiento de sujetos a lo largo de fotogramas, según el workflow publicado ("3D Human Mesh Extraction From Video").
- Integración nativa en ComfyUI mediante el nodo de detección y el workflow `utility_sam3d_body.json`.
- Dos niveles de precisión (bf16 e int8) para adaptarse a distintos presupuestos de VRAM.
- No se documentan capacidades de generación de texto, tool calling, agentes ni multilingüismo, al no tratarse de un modelo de lenguaje.

## Casos de uso

- **Transferencia de movimiento en animación**: extraer la malla y la pose 3D de un actor en vídeo para reutilizar el movimiento en un personaje digital, usando el workflow de ComfyUI que procesa la secuencia fotograma a fotograma.
- **Control de pose para generación de vídeo**: alimentar modelos de difusión de vídeo con la estructura corporal 3D estimada, de modo que el sujeto generado mantenga la pose y proporciones del original.
- **Rotoscopia y composición 3D**: obtener geometría del sujeto para insertarlo en escenas 3D o aplicar efectos de cámara coherentes con la perspectiva real.
- **Análisis biomecánico y deportivo**: estimar articulaciones y postura en secuencias de vídeo para medir ángulos, trayectorias y simetría del movimiento.
- **Previsualización de vestuario y VFX**: generar una malla base del actor para probar prendas o elementos digitales antes del rodaje, reduciendo costes de prueba.
- **Prototipado en pipelines de ComfyUI**: integrar la detección 3D dentro de un grafo más amplio (segmentación, generación, postproceso) gracias al formato safetensors y al nodo de detección nativo.
- **Investigación en visión por computador**: usar los pesos empaquetados como punto de partida reproducible para experimentos de reconstrucción corporal, eligiendo bf16 para máxima fidelidad o int8 para iterar con menos VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 7,7 GB e incluye dos variantes de pesos; la variante int8 reduce aproximadamente a la mitad la huella de la variante bf16, aunque el consumo real en inferencia depende del tamaño del lote y de la resolución de entrada.
- **GPU recomendadas**: no especificadas por el autor. Por el formato y el ecosistema ComfyUI, es esperable que funcione en GPU consumer con suficiente VRAM para cargar los pesos en bf16 (gama RTX 3090/4090 y superiores) y en int8 en tarjetas con menos memoria; no hay confirmación oficial en la información proporcionada.
- **Cabe en GPU consumer**: probable en función de la variante elegida; sin datos oficiales de VRAM mínima.
- **Opciones de despliegue**: ComfyUI (soporte nativo mediante el nodo de detección y el workflow `utility_sam3d_body.json`); otros runners (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo y no se documentan.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comfy-Org/sam-3d-body | Reconstrucción de malla corporal 3D | no disponible | no aplica | SAM License | Hugging Face + ComfyUI |
| facebook/sam-3d-body-dinov3 | Reconstrucción de malla corporal 3D (original) | no disponible | no aplica | SAM License | Hugging Face (Meta) |
| Otros modelos de human mesh recovery | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Licencia SAM**: la licencia `sam-license` de Meta impone condiciones específicas; debe revisarse el texto completo antes de cualquier uso comercial o redistribución.
- **Información técnica incompleta**: no se publican parámetros, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su robustez frente a otros métodos.
- **Riesgo de error en casos difíciles**: como todo modelo de reconstrucción corporal, puede fallar con oclusiones severas, cuerpos parcialmente fuera de encuadre, ropa muy holgada o poses extremas; no hay métricas oficiales que cuantifiquen este riesgo.
- **Sesgos del dataset**: no se documenta la composición demográfica del entrenamiento, por lo que no puede descartarse un rendimiento desigual según complexión, etnia o vestimenta.
- **Dependencia del ecosistema ComfyUI**: el empaquetado está pensado para ComfyUI; su uso fuera de ese entorno requiere adaptar la carga de pesos y el preprocesado.
- **Uso en producción**: al no haber datos de latencia, throughput ni VRAM mínima, es necesario realizar pruebas propias de rendimiento antes de desplegarlo.
- **No es un modelo de lenguaje**: no ofrece generación de texto, razonamiento simbólico ni soporte multilingüe; cualquier expectativa en ese sentido es incorrecta.

## Enlaces

- Repositorio empaquetado: https://huggingface.co/Comfy-Org/sam-3d-body
- Modelo original de Meta: https://huggingface.co/facebook/sam-3d-body-dinov3
- Licencia SAM: https://huggingface.co/facebook/sam-3d-body-dinov3/blob/main/LICENSE
- Workflow de ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_sam3d_body.json
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
