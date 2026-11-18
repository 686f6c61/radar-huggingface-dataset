# LBH-123-AI/Minimax_h3_latent_Upscaler

## Resumen

Minimax H3 Latent Upscaler es un modelo neuronal de superresolución que opera directamente en el espacio latente del VAE de Minimax H3, un modelo de generación de vídeo. Lo desarrolla el usuario LBH-123-AI y se distribuye bajo licencia Apache 2.0. Su función es ampliar la resolución espacial (alto × ancho) de los latentes de 24 canales que produce el VAE de Minimax H3, preservando la dimensión temporal, de modo que se pueda generar vídeo a baja resolución y refinarlo después sin pasar por el costoso ciclo de decodificación, escalado en píxeles y recodificación a través del VAE de aproximadamente 5.000 millones de parámetros.

El repositorio contiene dos variantes. La versión 3D original (3D_Conv_v1) tiene 345.280.216 parámetros y emplea convoluciones 3D con componente temporal. La versión 2D publicada el 10 de noviembre de 2026 (2D_Conv_v1) reduce el cómputo a 182.140.312 parámetros, la mitad aproximadamente, y mejora la calidad en la mayoría de escalas, además de incorporar seis niveles ajustables de nitidez.

El modelo es relevante porque elimina la necesidad de interpolar latentes con métodos ingenuos (bilineal o bicúbico), que introducen artefactos de doble imagen y ghosting, y porque acelera de forma sustancial la generación de vídeo en alta resolución al evitar el cuello de botella del VAE. Está pensado para integrarse en flujos de trabajo de ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional en espacio latente (3D_Conv_v1: convoluciones 3D con convolución temporal; 2D_Conv_v1: convoluciones 2D) |
| Parámetros totales | 3D_Conv_v1: 345.280.216; 2D_Conv_v1: 182.140.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre latentes de vídeo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un upscaler convolucional que trabaja sobre latentes de 24 canales del VAE de Minimax H3. La variante 3D_Conv_v1 utiliza convoluciones 3D, con una convolución temporal explícita que mantiene la coherencia entre fotogramas a lo largo del eje temporal. La variante 2D_Conv_v1 prescinde de esa componente temporal y opera con convoluciones 2D, lo que reduce a la mitad el número de parámetros (182,1 M frente a 345,3 M) y el tamaño de los checkpoints.

El entrenamiento se realizó sobre un conjunto de validación congelado de 2.500 pares, el mismo split usado durante el entrenamiento, y la cobertura de evaluación abarca 36 escalas entre 1,1× y 4,0×. La versión 3D se entrenó de forma nativa en cuatro escalas concretas (2×, 2,25×, 2,5× y 4×), lo que explica que solo supere a la 2D en esas cuatro escalas. La versión 2D incorpora seis niveles de nitidez ajustables (tier 1 a tier 6), donde el tier 1 es el más fiel y el tier 6 el más nítido; la versión 3D no dispone de este control y su nitidez equivale aproximadamente al tier 1 de la 2D. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO, algo por otra parte poco habitual en modelos de superresolución.

## Capacidades

- Superresolución en espacio latente de vídeo: amplía la resolución espacial (H×W) de los latentes de 24 canales del VAE de Minimax H3 manteniendo intacta la dimensión temporal.
- Soporte de escalas de 1,1× a 4,0×, con mejor comportamiento en el rango alto (3,1×–4,0×) en la variante 2D.
- Control de nitidez en seis niveles (solo 2D_Conv_v1), desde el más fiel hasta el más nítido.
- Preservación de la coherencia temporal en la variante 3D gracias a la convolución temporal.
- Reducción de artefactos de ghosting y doble imagen respecto a la interpolación bilineal o bicúbica.
- Integración con ComfyUI como nodo de upscaling latente.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un componente de un pipeline de generación de vídeo, no un modelo de lenguaje.

## Casos de uso

- Aceleración de generación de vídeo en alta resolución: se genera el vídeo a baja resolución (muchos menos tokens latentes y por tanto mucho más rápido), se aplica este upscaler sobre el latente y se vuelve a muestrear a la resolución objetivo para recuperar detalle. Evita el ciclo decodificar-escalar-codificar a través del VAE de unos 5.000 millones de parámetros.
- Refinado iterativo en pipelines de difusión de vídeo: el upscaler permite encadenar pasos de baja y alta resolución dentro de un mismo flujo de muestreo, reduciendo el coste total frente a generar directamente en la resolución final.
- Integración en ComfyUI: se usa como nodo dentro de grafos de generación de vídeo con Minimax H3, lo que facilita su adopción por parte de artistas y estudios que ya trabajan con esa herramienta.
- Restauración y ampliación de material ya generado: dado un latente de baja resolución, se puede ampliar hasta 4× con la variante 2D en el rango 3,1×–4,0×, donde la mejora de MSE latente sobre trilineal alcanza el 87,1 %.
- Sustitución de interpolación ingenua en producción: en pipelines existentes que hoy usan bilineal o bicúbico, el cambio a este upscaler reduce el chroma shift del 28,3 % al 16,4 % y eleva el PSNR decodificado de 23,54 a 30,47.
- Escalado controlado con nitidez ajustable: en la variante 2D, el operador puede elegir el tier de nitidez según el contenido (tier 1 para máxima fidelidad, tier 6 para material que requiere más definición), algo útil en flujos de posproducción.
- Investigación en upscaling latente: sirve como referencia reproducible para estudiar superresolución en espacio latente de VAEs de vídeo, dado que el autor publica un informe comparativo detallado con 36 escalas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 2.500 pares de validación, 36 escalas de 1,1× a 4,0×. Las métricas latentes se calculan sobre latentes normalizados; las de píxel se decodifican a través del VAE real de Minimax H3.

| Métrica | Trilineal (base) | 3D_Conv_v1 | 2D_Conv_v1 |
|---|---:|---:|---:|
| MSE latente (mejora media sobre trilineal, 36 escalas) | base | +61,1 % | +84,7 % |
| PSNR decodificado (media, mayor es mejor) | 23,54 | 29,30 | 30,47 |
| Nitidez (ratio de gradiente, 1,0 = referencia) | 1,429 | 0,869 | 0,897 |
| Desviación de croma (menor es mejor) | 28,3 % | 17,9 % | 16,4 % |
| Parámetros | — | 345.280.216 | 182.140.312 (52,8 %) |
| Niveles de nitidez ajustables | — | ninguno | 6 (t1–t6) |

Mejora de MSE latente sobre trilineal por rango de escala:

| Rango de escala | Escalas | 3D_Conv_v1 | 2D_Conv_v1 |
|---|---:|---:|---:|
| 1,1× – 1,4× | 5 | +28,1 % | +80,3 % |
| 1,5× – 2,0× | 7 | +60,9 % | +83,1 % |
| 2,1× – 3,0× | 12 | +64,3 % | +85,6 % |
| 3,1× – 4,0× | 12 | +70,3 % | +87,1 % |

Las únicas cuatro escalas donde la variante 3D supera a la 2D son exactamente las de su entrenamiento nativo:

| Escala | Ventaja de 3D sobre 2D |
|---|---:|
| 2× | 11,0 % mejor |
| 2,25× | 7,5 % mejor |
| 2,5× | 12,5 % mejor |
| 4× | 30,5 % mejor |

Escalera de nitidez de 2D_Conv_v1 (datos parciales en la información disponible):

| Tier | MSE latente | PSNR | Nitidez (ratio de gradiente) | Desviación de croma |
|---|---:|---:|---:|---:|
| t1 (más fiel) | 0,06835 | 31,18 | 0,947 | no disponible |

## Requisitos de hardware

- Tamaño del repositorio: 4,2 GB, lo que incluye los checkpoints de ambas variantes y los ejemplos.
- VRAM estimada: no disponible de forma explícita. Al tratarse de un modelo de 182 M (2D) o 345 M (3D) parámetros, los pesos ocupan del orden de 0,4–0,7 GB en fp16/fp32, pero el consumo real depende sobre todo del tamaño de los latentes de vídeo de entrada y del VAE de Minimax H3 con el que se combine.
- GPU recomendadas: no disponible. Cabe esperar que quepa en GPU de consumo (RTX 3060 en adelante) para los pesos del upscaler, pero el VAE de ~5.000 millones de parámetros del pipeline completo condiciona el requisito real de memoria.
- Cabe en GPU de consumo: sí para el upscaler en sí; el pipeline completo depende del VAE y del modelo de difusión de Minimax H3.
- Opciones de despliegue: ComfyUI (integración nativa indicada en la model card), PyTorch con safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card indica que el pipeline ahorra tiempo de generación al evitar el round-trip por el VAE, pero no publica cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de upscaling latente para Minimax H3 en la información proporcionada. La comparación más directa disponible es interna, entre las dos variantes del propio modelo y frente a la interpolación trilineal:

| Criterio | Trilineal | 3D_Conv_v1 | 2D_Conv_v1 |
|---|---|---|---|
| Tipo | Interpolación clásica | Red convolucional 3D | Red convolucional 2D |
| Parámetros | — | 345,3 M | 182,1 M |
| Mejora MSE latente | base | +61,1 % | +84,7 % |
| PSNR decodificado | 23,54 | 29,30 | 30,47 |
| Nitidez ajustable | no | no | sí (6 tiers) |
| Licencia | — | Apache 2.0 | Apache 2.0 |

## Limitaciones y advertencias

- La variante 3D solo es superior en 2×, 2,25×, 2,5× y 4×; en el resto de escalas conviene usar la 2D, que además tiene la mitad de parámetros.
- La variante 3D degrada de forma notable por debajo de 1,5× según el informe del autor.
- La nitidez de la variante 3D equivale aproximadamente al tier 1 de la 2D; no permite ajuste fino.
- El modelo está acoplado al VAE de 24 canales de Minimax H3: no es un upscaler genérico y no funcionará con otros VAEs sin reentrenamiento.
- Los resultados publicados proceden del propio autor y de un split de validación congelado del entrenamiento, no de una evaluación independiente.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa texto ni lenguaje; los sesgos del pipeline final dependerán del modelo de generación de vídeo de Minimax H3.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Minimax H3 con el que se combine.
- No se especifican tipos de cuantización soportados ni requisitos de VRAM del pipeline completo, lo que dificulta planificar el despliegue en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- README en inglés: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/README.md
- README en chino: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/README_zh.md
- Informe comparativo completo 3D vs 2D (HTML, 9,3 MB): https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/examples/3D_Conv_v1_vs_2D_Conv_v1.html
- Ejemplo de vídeo comparativo: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_001.mp4
- Ejemplo de imagen comparativa: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_002.jpg
- Gráfico de MSE latente por escala: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/3D_Conv_v1_vs_2D_Conv_v1.png
