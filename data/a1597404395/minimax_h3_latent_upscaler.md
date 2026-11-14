# A1597404395/Minimax_h3_latent_Upscaler

## Resumen

Minimax H3 Latent Upscaler es un modelo neuronal de superresolución que opera directamente en el espacio latente del VAE de Minimax H3, un modelo de generación de vídeo. Lo desarrolla el usuario A1597404395 (vinculado en la model card al espacio LBH-123-AI) y resuelve un cuello de botella concreto del pipeline de generación de vídeo en alta resolución: en lugar de decodificar el latente a píxeles, reescalar en espacio de píxeles y volver a codificar (un recorrido que atraviesa un VAE de aproximadamente 5.000 millones de parámetros), el modelo amplía la resolución espacial H×W del latente de 24 canales preservando la dimensión temporal. Esto evita el coste computacional del round-trip por el VAE y elimina los artefactos de ghosting y doble imagen que introduce la interpolación bilineal o bicúbica ingenua.

El repositorio contiene dos variantes: una versión 3D con convoluciones espaciotemporales de 345.280.216 parámetros, y una versión 2D publicada el 10 de noviembre de 2026 con 182.140.312 parámetros (52,8 % del tamaño de la 3D) que supera a la 3D en 32 de las 36 escalas evaluadas. La versión 2D añade además seis niveles ajustables de nitidez. El modelo se distribuye en formato safetensors con licencia Apache 2.0 y está pensado para integrarse en flujos de ComfyUI.

La relevancia actual del modelo es práctica: permite generar vídeo a baja resolución (con muchos menos tokens latentes y por tanto mucho más rápido), ampliar el latente in-place con este upscaler y refinar después a la resolución objetivo. Es una pieza de infraestructura para acelerar pipelines de difusión de vídeo, no un modelo generativo autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Upscaler neuronal en espacio latente con convoluciones 3D espaciotemporales (v1 3D) y convoluciones 2D (v1 2D); opera sobre latentes de 24 canales del VAE de Minimax H3 |
| Parámetros totales | 345.280.216 (3D v1) / 182.140.312 (2D v1) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa latentes de vídeo) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La versión 3D v1 emplea convoluciones 3D que operan conjuntamente sobre las dimensiones espacial y temporal del latente, lo que le permite preservar la coherencia temporal mientras amplía H×W. La versión 2D v1 reduce el coste a la mitad de parámetros aplicando convoluciones 2D, y según la model card obtiene mejor calidad en la mayoría de escalas pese a ese recorte. El modelo trabaja sobre los latentes normalizados de 24 canales del VAE de Minimax H3 y mantiene intacta la dimensión temporal.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (poco probables en un upscaler de este tipo). Sí se documenta el protocolo de evaluación: 2.500 pares de validación sobre un split congelado usado también en entrenamiento, con métricas calculadas en dominio latente (MSE) y en píxeles tras decodificar con el VAE real de Minimax H3, cubriendo 36 escalas entre 1,1× y 4,0×. La versión 3D v1 se entrenó nativamente en cuatro escalas concretas (2×, 2,25×, 2,5× y 4×), lo que explica su comportamiento irregular fuera de ellas.

## Capacidades

- Superresolución de latentes de vídeo de Minimax H3 en el rango de 1,1× a 4,0×, preservando la dimensión temporal.
- Operación directa sobre latentes de 24 canales del VAE, sin decodificación a píxeles ni recodificación.
- Eliminación de artefactos de ghosting y doble imagen propios de la interpolación bilineal o bicúbica en espacio latente.
- Ajuste de nitidez en seis niveles (tiers t1–t6) en la variante 2D v1, donde t1 es el más fiel y t6 el más nítido.
- Integración con ComfyUI (etiqueta declarada en el repositorio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Aceleración de pipelines de generación de vídeo en alta resolución: generar primero a baja resolución (menos tokens latentes, inferencia más rápida), aplicar el upscaler sobre el latente y refinar a la resolución objetivo, evitando el round-trip decode → upscale en píxeles → encode por el VAE de ~5.000 millones de parámetros.
- Reducción de coste en producción de vídeo con Minimax H3: al eliminar la decodificación y recodificación intermedias por el VAE pesado, se recorta el tiempo total de generación en cada paso de escalado.
- Postprocesado de latentes en flujos de ComfyUI: nodo de escalado latente que sustituye a la interpolación trilineal en grafos existentes, con la variante 2D como opción por defecto por su mejor MSE en la mayoría de escalas.
- Escalado a 2×, 2,25×, 2,5× y 4× con máxima calidad: usar la variante 3D v1, entrenada nativamente en esas cuatro escalas, donde supera a la 2D entre un 7,5 % y un 30,5 % en MSE latente.
- Control de nitidez en la salida final: la variante 2D permite elegir entre seis tiers para equilibrar fidelidad y nitidez según el contenido (t1 para máxima fidelidad, t6 para máximo detalle percibido).
- Investigación sobre superresolución en espacio latente: el repositorio incluye un informe comparativo completo con 36 escalas, métricas en dominio latente y de píxeles, y análisis de consistencia temporal, útil como referencia para desarrollar upscalers similares.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre 2.500 pares de validación y 36 escalas (1,1×–4,0×):

| Métrica | Trilinear | 3D_Conv_v1 | 2D_Conv_v1 |
|---|---:|---:|---:|
| Mejora media de MSE latente frente a trilineal (36 escalas) | línea base | +61,1 % | +84,7 % |
| PSNR decodificado (media, mayor es mejor) | 23,54 | 29,30 | 30,47 |
| Nitidez (ratio de gradiente, 1,0 = verdad de referencia) | 1,429 | 0,869 | 0,897 |
| Desviación de croma (menor es mejor) | 28,3 % | 17,9 % | 16,4 % |
| Parámetros | — | 345.280.216 | 182.140.312 (52,8 %) |
| Niveles de nitidez ajustables | — | ninguno | 6 (t1–t6) |

Mejora de MSE latente frente a trilineal por rango de escala:

| Rango de escala | Escalas | 3D_Conv_v1 | 2D_Conv_v1 |
|---|---:|---:|---:|
| 1,1× – 1,4× | 5 | +28,1 % | +80,3 % |
| 1,5× – 2,0× | 7 | +60,9 % | +83,1 % |
| 2,1× – 3,0× | 12 | +64,3 % | +85,6 % |
| 3,1× – 4,0× | 12 | +70,3 % | +87,1 % |

Escalas donde la variante 3D supera a la 2D (ventaja en MSE latente):

| Escala | Ventaja de 3D sobre 2D |
|---|---:|
| 2× | 11,0 % mejor |
| 2,25× | 7,5 % mejor |
| 2,5× | 12,5 % mejor |
| 4× | 30,5 % mejor |

Escalera de nitidez de la variante 2D v1 (datos parciales; la model card solo muestra la fila t1 en la información disponible):

| Tier | MSE latente | PSNR | Nitidez (ratio de gradiente) | Desviación de croma |
|---|---:|---:|---:|---:|
| t1 (más fiel) | 0,06835 | 31,18 | 0,947 | no disponible |

## Requisitos de hardware

- Tamaño del repositorio: 4,2 GB, coherente con los checkpoints safetensors de ambas variantes (345,3 M y 182,1 M de parámetros).
- VRAM estimada para inferencia: no disponible de forma explícita; a título orientativo, un modelo de 182 M de parámetros en fp16 ocupa aproximadamente 0,4 GB de pesos, y el de 345 M aproximadamente 0,7 GB, a lo que hay que sumar los latentes de vídeo de 24 canales y las activaciones intermedias.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño de los pesos, cabría en GPUs de consumo con suficiente VRAM para los latentes, pero no se documenta.
- Opciones de despliegue: ComfyUI (etiqueta declarada); PyTorch con pesos safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo permite comparar las dos variantes del propio modelo y la interpolación trilineal como línea base. No se han identificado en la información disponible otros upscalers de latentes para Minimax H3 con los que comparar.

| Modelo | Parámetros | Mejora MSE latente vs. trilineal | PSNR decodificado | Nitidez ajustable | Licencia |
|---|---:|---:|---:|---|---|
| Minimax H3 Latent Upscaler 3D v1 | 345.280.216 | +61,1 % | 29,30 | No | Apache 2.0 |
| Minimax H3 Latent Upscaler 2D v1 | 182.140.312 | +84,7 % | 30,47 | Sí (6 tiers) | Apache 2.0 |
| Interpolación trilineal (línea base) | — | — | 23,54 | No | — |

## Limitaciones y advertencias

- La variante 3D v1 degrada notablemente por debajo de 1,5× y solo supera a la 2D en las cuatro escalas en las que fue entrenada (2×, 2,25×, 2,5×, 4×); fuera de ellas es la peor opción de las dos.
- La variante 3D no ofrece control de nitidez; su nitidez queda fijada en un valor equivalente aproximadamente al tier 1 de la 2D.
- El modelo está acoplado específicamente al VAE de 24 canales de Minimax H3: no es un upscaler genérico y no funcionará con latentes de otros modelos sin reentrenamiento.
- La evaluación se realizó sobre un split congelado usado también durante el entrenamiento, lo que puede sobreestimar el rendimiento en datos totalmente nuevos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa texto ni genera contenido semántico; su salida hereda las características del generador Minimax H3 subyacente.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el 2026-11-14; se trata de una publicación muy reciente y con poca validación externa.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de la licencia del propio Minimax H3 y de su VAE, de los que el modelo depende en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/A1597404395/Minimax_h3_latent_Upscaler
- Espacio del autor referenciado en la model card: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- README en inglés: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/README.md
- README en chino: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/README_zh.md
- Informe comparativo completo 3D v1 vs 2D v1 (HTML, 9,3 MB): https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/examples/3D_Conv_v1_vs_2D_Conv_v1.html
- Vídeo de ejemplo: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_001.mp4
- Imagen de ejemplo: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_002.jpg
- Gráfica de MSE latente por escala: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/3D_Conv_v1_vs_2D_Conv_v1.png
