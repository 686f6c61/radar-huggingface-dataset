# singam96/ShadeNet-6-XS-2M

## Resumen

ShadeNet-6 XS es un modelo de renderizado inverso (descomposición intrínseca) de una sola imagen desarrollado por el usuario singam96. Dada una fotografía RGB, produce tres mapas intrínsecos en una sola pasada: albedo (color base), profundidad relativa y normales de superficie. El modelo se enmarca en la familia ShadeNet, de la que existen variantes previas (ShadeNet-5) y una hermana mayor (ShadeNet-6 L), y su propuesta principal es la eficiencia extrema: 1,99 millones de parámetros frente a los 34,65 millones de ShadeNet-5.

La arquitectura combina cuatro componentes pequeños en cadena: una red densa de parches que aporta una primera estimación gruesa, un backbone MobileNetV3-small preentrenado en ImageNet y congelado, un decodificador fino depthwise-separable, una segunda red densa de parches y un refinador final. La salida es un tensor de 7 canales en el rango [-1, 1]. El modelo está pensado para escenarios donde el coste computacional y el tamaño del artefacto importan más que la precisión máxima.

Es relevante ahora por su perfil de despliegue: una pasada hacia delante tarda unos 19 ms por imagen de 448x448 en una RTX 5060 Ti, lo que lo sitúa como candidato para procesamiento de vídeo o pipelines de visión en tiempo real en hardware de consumo. La contrapartida es una precisión inferior a la de sus hermanos mayores, con un error medio L1 aproximadamente un 6 % superior al de ShadeNet-5 en el mismo conjunto de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feed-forward en cascada: red densa de parches + MobileNetV3-small congelado con decodificador depthwise-separable + segunda red densa de parches + refinador |
| Parametros totales | 1.992.944 (1,99 M) |
| Parametros activos | No aplica (no es MoE); 1,12 M entrenables y 0,87 M del trunk MobileNetV3-small congelados |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (se indica PyTorch y torchvision; el tamano del repo es 0.0 GB) |

## Arquitectura y entrenamiento

ShadeNet-6 XS es una red puramente feed-forward compuesta por cuatro subredes en serie, con un stop-gradient entre cada par. La primera red densa de parches genera una estimación inicial de los mapas intrínsecos; el backbone MobileNetV3-small, con pesos de ImageNet y congelado, extrae características; un decodificador fino depthwise-separable las proyecta a la resolución de salida; una segunda red densa de parches corrige la estimación; y un refinador final pule el resultado. La salida son 7 canales: `[0:3]` albedo, `[3:4]` profundidad y `[4:7]` normales, todos normalizados a [-1, 1]. La profundidad es relativa por imagen (valores mayores indican mayor distancia) y las normales siguen la convención x a la derecha, y hacia arriba, z hacia el observador.

El modelo se entrena desde cero, salvo el trunk MobileNetV3-small, que permanece en sus pesos de ImageNet. La entrada debe tener dimensiones múltiplas de 32; en el entrenamiento se usó 448x448, aunque el script de inferencia conserva la fotografía completa. No se especifican en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo). Las etiquetas de validación son pseudo-etiquetas generadas con Marigold-V2, no mediciones reales.

## Capacidades

- Renderizado inverso de una sola imagen: genera albedo, profundidad relativa y normales de superficie en una única pasada.
- Descomposición intrínseca con convención de 7 canales y salida normalizada en [-1, 1].
- Procesamiento de imágenes de resolución arbitraria siempre que las dimensiones sean múltiplos de 32.
- Inferencia de baja latencia (aproximadamente 19 ms por imagen de 448x448 en RTX 5060 Ti).
- Promediado en espejo y en rotaciones en tiempo de test (mejora marginal de unos 0,001 en error medio L1).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo exclusivamente de visión.
- No dispone de modo de pensamiento, audio ni otras modalidades.

## Casos de uso

- Reconstrucción 3D y captura de movimiento: los mapas de profundidad relativa y normales permiten alimentar pipelines de fotogrametría o de reconstrucción de superficies a partir de vídeo, donde la latencia de 19 ms por fotograma hace viable el procesamiento en tiempo real.
- Edición fotográfica basada en intrínsecas: separar albedo y sombreado permite recolorear objetos, cambiar la iluminación percibida o aplicar correcciones de color sin afectar a la geometría de la escena, útil en herramientas de retoque.
- Previsualización en dispositivos de gama baja: con 1,99 M de parámetros y un backbone MobileNetV3-small, el modelo puede ejecutarse en GPUs de consumo e incluso en entornos con recursos limitados para tareas de previsualización rápida.
- Generación de datos sintéticos para entrenamiento: los mapas de normales y profundidad pueden usarse como pseudo-etiquetas para aumentar datasets de visión por computador en tareas de segmentación o detección.
- Realidad aumentada: la estimación de normales y profundidad relativa permite anclar objetos virtuales sobre superficies reales con una latencia compatible con aplicaciones interactivas.
- Procesamiento de vídeo a gran escala: el bajo coste por fotograma permite procesar flujos de vídeo completos en bruto para análisis de escena, con un coste computacional muy inferior al de modelos como ShadeNet-5 (267 ms por imagen en su receta de seis pasadas).
- Análisis de escenas en robótica ligera: la profundidad relativa y las normales pueden servir como entrada a módulos de navegación o manipulación en plataformas con presupuesto energético reducido.

## Benchmarks y rendimiento

Resultados de error medio L1 por mapa sobre las mismas 23 imágenes de validación (menor es mejor; albedo y normales evaluados solo en píxeles etiquetados, profundidad en todos los píxeles):

| Modelo y receta | Parametros | Albedo | Depth | Normal | Media |
|---|---|---|---|---|---|
| ShadeNet-5, pasada unica + normales unitarias | 34,65 M | 0,166 | 0,169 | 0,163 | 0,1659 |
| ShadeNet-5 + su refinador | 34,65 M + 0,91 M | 0,160 | 0,168 | 0,151 | 0,1597 |
| ShadeNet-5, seis pasadas | 34,65 M | 0,158 | 0,162 | 0,150 | 0,1562 |
| ShadeNet-6 XS, pasada unica + normales unitarias | 1,99 M | 0,176 | 0,186 | 0,166 | 0,1759 |
| ShadeNet-6 XS, promedio en espejo | 1,99 M | 0,174 | 0,185 | 0,165 | 0,1746 |
| ShadeNet-6 XS, seis pasadas | 1,99 M | 0,174 | 0,187 | 0,165 | 0,1751 |
| ShadeNet-6 L, pasada unica + normales unitarias | 98,35 M | 0,123 | 0,124 | 0,122 | 0,1232 |

Diferencias pareadas por imagen (ShadeNet-6 XS menos ShadeNet-5; positivo indica que XS es peor):

| Comparacion | Diferencia | XS mejor en |
|---|---|---|
| Pasada unica vs pasada unica | +0,0100 ± 0,0041 | 8 de 23 imagenes |
| Pasada unica vs ShadeNet-5 + refinador | +0,0162 ± 0,0038 | 3 de 23 |
| Seis pasadas vs seis pasadas de ShadeNet-5 | +0,0189 ± 0,0042 | 4 de 23 |

El modelo queda por detrás en los tres mapas, con la mayor brecha en profundidad (0,186 frente a 0,169) y la menor en normales (0,166 frente a 0,163). La diferencia pareada de +0,010 ± 0,004 equivale a unas 2,4 veces el error estándar, por lo que la clasificación debe tomarse como indicativa. La validación se realizó sobre 23 imágenes y etiquetas pseudo-reales de Marigold-V2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,99 M de parámetros y entrada de 448x448, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU moderna (estimación cualitativa, no confirmada en la información).
- GPU recomendadas: RTX 5060 Ti como referencia medida (19 ms por imagen); cualquier GPU consumer reciente debería ejecutarlo sin problemas.
- Cabe en GPU de consumo: sí, por su tamaño reducido y su backbone MobileNetV3-small.
- Opciones de despliegue: PyTorch con torchvision para la definición del MobileNet; el repositorio incluye código de inferencia autónomo en `inference/`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: aproximadamente 19 ms por imagen de 448x448 en RTX 5060 Ti en una pasada; ShadeNet-5 en su receta de seis pasadas tarda unos 267 ms por imagen en la misma GPU, y ShadeNet-6 L unos 39 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Error medio L1 (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShadeNet-6 XS | 1,99 M | Imagen, multiplos de 32 (448 en entrenamiento) | 0,1759 | Apache-2.0 | Hugging Face |
| ShadeNet-5 | 34,65 M (+0,91 M refinador) | Imagen | 0,1597 (con refinador) | No disponible | Hugging Face (familia ShadeNet) |
| ShadeNet-6 L | 98,35 M | Imagen | 0,1232 | No disponible | Hugging Face (familia ShadeNet) |

No se dispone de información sobre otros modelos comparables de descomposición intrínseca en la documentación proporcionada.

## Limitaciones y advertencias

- Precisión inferior a ShadeNet-5: el error medio L1 es aproximadamente un 6 % mayor en pasada única y un 10-12 % mayor frente a las recetas refinadas y de seis pasadas.
- El conjunto de validación es muy reducido (23 imágenes) y las etiquetas son pseudo-etiquetas de Marigold-V2, no mediciones reales; la diferencia pareada de +0,010 ± 0,004 es solo unas 2,4 veces el error estándar, por lo que la comparación es indicativa.
- La profundidad es relativa por imagen, no métrica: no debe interpretarse como distancia absoluta en metros.
- Las normales siguen una convención concreta (x derecha, y arriba, z hacia el observador) que debe respetarse en la integración.
- El promediado en espejo y en rotaciones aporta mejoras marginales (unos 0,001), a diferencia de ShadeNet-5, donde la ganancia es mayor.
- No se especifican sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas en la información disponible (el modelo no procesa texto).
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están publicados o que la información está incompleta; conviene verificar la disponibilidad real de los artefactos antes de integrarlo en producción.
- No se documentan datos de entrenamiento (número de imágenes, composición del dataset), lo que dificulta evaluar su robustez en dominios distintos al de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singam96/ShadeNet-6-XS-2M
