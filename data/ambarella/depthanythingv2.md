# Ambarella/DepthAnythingV2

## Resumen

DepthAnythingV2 es un modelo de estimación de profundidad monocular (MDE, *monocular depth estimation*) que predice un mapa de profundidad por píxel a partir de una única imagen RGB. Esta ficha concreta, publicada por Ambarella bajo el identificador `Ambarella/DepthAnythingV2`, no es el modelo original de investigación, sino una conversión y optimización del checkpoint oficial **DepthAnythingV2-Small** (variante con backbone ViT-S, *depth_anything_v2_vits.pth*) para su despliegue sobre los SoC de visión de Ambarella (familias N1, X7, CV7, CV72 y CV75). El modelo original procede del paper *Depth Anything V2* (arXiv:2406.09414) del equipo Depth Anything.

El problema que resuelve es la percepción de profundidad densa a partir de una sola cámara, sin necesidad de sensores LiDAR ni estéreo, lo que abarata y simplifica pipelines de robótica, AR/VR, reconstrucción de escena y percepción 3D en tiempo real en dispositivos de borde. La variante Small se elige precisamente por su equilibrio entre tamaño, velocidad de inferencia y precisión, lo que la hace apta para hardware embebido con recursos limitados.

La relevancia de este repositorio es de ingeniería más que de investigación: Ambarella distribuye binarios precompilados (`.bin`) por plataforma, con dos modos de compresión (`Amba_optimized` y `Activation_fp16`), lo que permite ejecutar el modelo directamente sobre sus aceleradores NPU sin necesidad de exportar ni cuantizar a mano. El repo ocupa 0,3 GB y la licencia no se declara en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-S (variante Small de DepthAnythingV2) como encoder de profundidad; resolución de entrada 3x224x224 |
| Parametros totales | no disponible (la variante Small de DepthAnythingV2 se basa en ViT-S, pero el numero exacto no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | Binarios precompilados `Amba_optimized` y `Activation_fp16`; no se detallan esquemas de cuantizacion adicionales |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | `.bin` propietario por plataforma (N1-655, X7, CV7, CV72, CV75); checkpoint original en `.pth` (PyTorch) referenciado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DepthAnythingV2, un transformer de visión (ViT) que actúa como encoder de profundidad y produce un mapa denso por píxel. La variante Small emplea un backbone ViT-S, lo que reduce el coste computacional frente a las variantes Base y Large del mismo paper. La entrada se fija en 3x224x224 según la configuración indicada en la model card. El checkpoint de referencia es `depth_anything_v2_vits.pth`, descargable desde el repositorio oficial `depth-anything/Depth-Anything-V2-Small`.

No se detallan en la información proporcionada ni el volumen de datos de entrenamiento, ni la composición del dataset, ni si hubo etapas de refinamiento (por ejemplo, destilación desde modelos mayores o ajuste con datos sintéticos), más allá de la referencia al paper original. Tampoco se describen innovaciones técnicas específicas de esta conversión más allá de la optimización para las NPU de Ambarella. Para los detalles de entrenamiento del modelo base conviene consultar el paper arXiv:2406.09414 y el repositorio oficial.

## Capacidades

- Estimación de profundidad monocular densa: genera un mapa de profundidad por píxel a partir de una sola imagen RGB.
- Percepción 3D en tiempo real: pensado para ejecución de baja latencia en dispositivos de borde.
- Generalización entre escenas: el modelo original está diseñado para funcionar en dominios variados (interiores, exteriores, escenas no vistas).
- Integración en pipelines de AR/VR, robótica y reconstrucción de escena.
- Despliegue sobre aceleradores Ambarella: binarios específicos para N1-655, X7, CV7, CV72 y CV75, con SDK Cooper 2.5.4 y Cooper Foundry 2.3.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- **Robótica móvil y navegación:** el modelo proporciona un mapa de profundidad denso desde una única cámara, suficiente para evitar obstáculos y planificar trayectorias en robots con presupuesto de sensores limitado; la variante Small encaja en el cómputo de un SoC embebido.
- **AR/VR y captura de escena:** estimación de profundidad por fotograma para oclusión y anclaje de objetos virtuales; los binarios `Activation_fp16` permiten mantener precisión razonable con latencia baja en gafas o visores.
- **Reconstrucción 3D y fotogrametría ligera:** conversión de imágenes RGB a nubes de puntos o mapas de disparidad como paso previo a la reconstrucción, útil en inspección industrial o documentación de patrimonio.
- **Vigilancia y análisis de escena en cámara IP:** las plataformas CV7, CV72 y CV75 de Ambarella están orientadas a cámaras de seguridad; el modelo añade profundidad a la detección y seguimiento sin hardware estéreo.
- **Drones y vehículos no tripulados:** percepción de profundidad a bordo para aterrizaje, evitación de obstáculos y seguimiento de terreno con SWaP restringido.
- **Automatización industrial y AGV:** detección de distancias a operarios y obstáculos en almacenes, aprovechando la integración con el SDK Cooper para desplegar sobre el hardware existente.
- **Prototipado en edge con Ambarella:** evaluación rápida de la viabilidad de un producto de percepción 3D usando los binarios ya compilados, sin necesidad de toolchain de conversión propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (AbsRel, RMSE, δ1, etc.) ni comparativas numéricas con otras variantes de DepthAnythingV2.

## Requisitos de hardware

- **VRAM / memoria:** no disponible en la información proporcionada. Al ser un modelo de visión de entrada fija 3x224x224 con backbone ViT-S, su huella es reducida, pero no se dan cifras oficiales.
- **GPU recomendadas:** no se especifican. El destino principal son las NPU de Ambarella (N1-655, X7, CV7, CV72, CV75), no GPUs de escritorio.
- **Consumer GPU:** no disponible; no se documenta soporte para GPUs de consumo.
- **Opciones de despliegue:** binarios propietarios `.bin` por plataforma, ejecutables mediante Cooper SDK 2.5.4 y Cooper Foundry 2.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Ambarella/DepthAnythingV2 (esta ficha) | ViT-S (Small) | 3x224x224 | no disponible | Binarios `.bin` para NPU Ambarella | Conversión optimizada del checkpoint oficial |
| depth-anything/Depth-Anything-V2-Small | ViT-S | no disponible en esta ficha | no disponible | PyTorch (`.pth`) | Checkpoint original de referencia |
| DepthAnythingV2 (Base / Large) | ViT-B / ViT-L | no disponible en esta ficha | no disponible | PyTorch | Variantes mayores del mismo paper, mayor precisión a mayor coste |
| Otros MDE monofocales (p. ej. MiDaS, Marigold) | no disponible | no disponible | no disponible | PyTorch | Alternativas de la misma categoría; no se dispone de datos comparativos en la información proporcionada |

No se dispone de métricas comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Licencia no declarada:** la model card no especifica licencia, lo que impide confirmar si el uso comercial está permitido. Es un riesgo relevante para producción; conviene consultar la licencia del modelo original (DepthAnythingV2) y del checkpoint de referencia antes de desplegar.
- **Formato propietario:** los pesos se distribuyen como binarios `.bin` atados a plataformas Ambarella concretas; no son portables a otras GPUs o NPUs sin reconversión.
- **Entrada fija 3x224x224:** la resolución limitada puede degradar la precisión en escenas con detalles finos o estructuras lejanas.
- **Modelo de visión, no de lenguaje:** no soporta texto, tool calling, agentes ni multilingüismo; cualquier expectativa en ese sentido es errónea.
- **Riesgo de alucinación geométrica:** como todo modelo MDE, puede producir profundidades plausibles pero incorrectas en superficies reflectantes, transparentes, texturas repetitivas o iluminación adversa.
- **Sesgos de dominio:** el modelo original puede comportarse peor en dominios alejados de su distribución de entrenamiento (por ejemplo, imágenes médicas o microscopía).
- **Sin benchmarks en esta ficha:** no se han publicado métricas en la información disponible; la evaluación debe hacerse por cuenta propia sobre el caso de uso concreto.
- **Dependencia del SDK:** el despliegue requiere Cooper SDK 2.5.4 y Cooper Foundry 2.3, lo que limita la portabilidad y añade dependencia de proveedor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/DepthAnythingV2
- Paper original: https://arxiv.org/abs/2406.09414
- Código oficial DepthAnythingV2: https://github.com/DepthAnything/Depth-Anything-V2
- Checkpoint original Small: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
- Pesos originales ViT-S: https://huggingface.co/depth-anything/Depth-Anything-V2-Small/resolve/main/depth_anything_v2_vits.pth
- Binarios Ambarella (N1-655, X7, CV7, CV72, CV75): disponibles en el propio repositorio Hugging Face bajo los nombres `n1-655_*`, `x7_*`, `cv7_*`, `cv72_*` y `cv75_*`
