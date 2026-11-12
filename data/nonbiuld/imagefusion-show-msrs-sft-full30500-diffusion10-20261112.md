# Nonbiuld/ImageFusion-Show-MSRS-SFT-full30500-diffusion10-20261112

## Resumen

ImageFusion-Show es un checkpoint de ajuste supervisado (SFT) orientado a la fusión de imágenes infrarrojas y visibles, desarrollado por el usuario Nonbiuld sobre el modelo base showlab/show-o2-1.5B-HQ (1.500 millones de parámetros). El modelo parte de la arquitectura Show-o2, un transformer multimodal que combina un backbone autorregresivo con un cabezal de difusión, y en esta etapa concreta se ha especializado en la generación de imágenes fusionadas a partir de pares IR/VIS. El repositorio contiene el estado final tras 10 épocas de entrenamiento exclusivamente de difusión, completadas el 12 de noviembre de 2026.

El interés de este checkpoint es acotado pero técnico: documenta con precisión un estado intermedio de entrenamiento reproducible, con identidad de fichero verificada (SHA256), receta de entrenamiento explícita y auditoría de tensores congelados y entrenables. No es un modelo listo para producción ni un directorio estándar de Transformers, sino un estado de proyecto que requiere el cargador específico de ImageFusion-Show, la configuración fijada y un VAE Wan2.1 congelado cargado por separado.

La relevancia actual reside en su uso como referencia para investigación en fusión de imágenes multimodal y para reproducir la receta de SFT con pérdida de flow-matching sobre el backbone Show-o2. El autor advierte explícitamente de que el checkpoint final no ha sido evaluado visualmente y de que no se reclama ningún benchmark agregado ni generalización a conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Show-o2 (backbone autorregresivo multimodal + cabezal de difusión con flow-matching) |
| Parametros totales | 1.5B (modelo base show-o2-1.5B-HQ); 910 tensores de estado en el checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original, sin conversión de dtype) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`checkpoint-final.pt`, 18.33 GB, 910 tensores, 11.32 GB de almacenamiento tensorial) |

## Arquitectura y entrenamiento

El modelo se construye sobre Show-o2-1.5B-HQ, un transformer multimodal que separa un backbone autorregresivo (AR) y módulos compartidos de un cabezal de difusión. En esta etapa de SFT solo fueron entrenables `backbone.diff_proj`, `backbone.diffusion_head_a` y `backbone.diffusion_head_b` (139 tensores); los 771 tensores restantes del backbone AR y módulos compartidos permanecieron congelados, verificado mediante comparación en CPU contra la inicialización. El VAE original de Wan2.1 se mantiene congelado y se carga por separado.

El entrenamiento partió del checkpoint MSRS full-parameter step30500 (aproximadamente 35,55 épocas de parámetros completos) y realizó 8.580 actualizaciones del optimizador en 10 épocas, con `training_phase=sft_diffusion10`. Se usaron 7 GPUs, batch size 1 por rango, acumulación de gradiente 1 y batch global de 7; el manifiesto de 6.000 episodios produce 858 actualizaciones por época. Se inició un optimizador y scheduler nuevos, con learning rate 1e-5, warmup de 100 pasos, historial SFT con teacher forcing, peso de pérdida AR de 0 y peso de pérdida de flow-matching de 1, con pesos IR/VIS/Fusión de 1:1:1. Las imágenes conservan dimensiones rectangulares nativas (caso MSRS: 640x480). El código oficial de Show-o está fijado al commit `45a5a2de01d1ebd10cd5864d29310a76476cdf23`.

## Capacidades

- Fusión de imágenes infrarrojas y visibles: genera una imagen fusionada a partir de un par IR/VIS, preservando dimensiones rectangulares nativas.
- Generación condicionada por difusión con flow-matching sobre el backbone Show-o2.
- Reconstrucción de escenas degradadas: el checkpoint previo (diffusion8100) mostró mejora en métricas de reconstrucción con entradas degradadas respecto a una evaluación full30000 anterior.
- Capacidades del backbone AR heredadas del modelo base Show-o2 (generación de texto e imagen multimodal), aunque en esta etapa el peso de pérdida AR es 0 y el ajuste se centró en difusión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio especial: no disponible en la información proporcionada.

## Casos de uso

- Investigación en fusión de imágenes IR/VIS: el checkpoint sirve como punto de partida reproducible para experimentar con la receta de SFT de difusión sobre Show-o2, con configuración y commit fijados y auditoría de tensores documentada.
- Reproducción de experimentos: al incluir el optimizador de difusión, el scheduler, los estados RNG de siete rangos y el manifiesto de identidad, permite retomar o auditar el entrenamiento en un entorno controlado con el cargador de ImageFusion-Show.
- Vigilancia y percepción nocturna: la fusión de información térmica (IR) y visible es aplicable a escenas de baja iluminación donde la imagen visible pierde detalle; el modelo preserva dimensiones nativas como 640x480.
- Evaluación comparativa de checkpoints: útil para comparar el estado final8580 frente a diffusion8100 y full30000 en escenas concretas (p. ej. la escena de entrenamiento 00001D), midiendo el efecto de las épocas adicionales de difusión.
- Estudio de congelación selectiva de parámetros: el registro de 771 tensores congelados y 139 entrenables sirve como caso de estudio de SFT con backbone AR congelado y solo cabezales de difusión activos.
- Base para ablaciones controladas: aunque el autor advierte que la comparación actual no es una ablación causal controlada, el checkpoint es un punto de partida para diseñar experimentos que aíslen el efecto del entrenamiento de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ningún benchmark agregado, pase de inferencia formal ni RL, y que el checkpoint final8580 no ha sido evaluado visualmente. La única evaluación mencionada corresponde al checkpoint previo diffusion8100 sobre la escena de entrenamiento 00001D, con mejora en métricas de reconstrucción con entradas degradadas y descenso en métricas con entradas originales, persistiendo errores en ropa, bordes de piernas y detalle térmico; el autor aclara que estos resultados no establecen el rendimiento de final8580 ni la generalización a test.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 18,33 GB en disco e incluye el optimizador de difusión (7,01 GB) además de los tensores del modelo (11,32 GB); para inferencia solo se requiere la parte del modelo, pero no se proporciona una estimación de VRAM de inferencia en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento se realizó con 7 GPUs en paralelo (modelo no especificado).
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada.
- Opciones de despliegue: no es un directorio estándar de Transformers `from_pretrained`; requiere el cargador de checkpoint de ImageFusion-Show, los assets de configuración fijados y el VAE Wan2.1 congelado cargado por separado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImageFusion-Show (este checkpoint) | 1.5B (base) | no disponible | Fusión IR/VIS mediante difusión | no disponible | Hugging Face, requiere cargador propio |
| showlab/show-o2-1.5B-HQ | 1.5B | no disponible | Modelo multimodal base Show-o2 | no disponible | Hugging Face (modelo base) |
| Checkpoint MSRS full-parameter step30500 (Nonbiuld) | 1.5B (base) | no disponible | Fusión IR/VIS, SFT de parámetros completos | no disponible | Hugging Face (checkpoint previo) |

No se dispone de datos de rendimiento comparables entre estos checkpoints en la información proporcionada; la comparación se limita a la relación de inicialización y al alcance de parámetros entrenados.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el cargador de ImageFusion-Show, la configuración fijada (`configs/msrs/sft_diffusion10_after_full30500.yaml`) y el VAE Wan2.1 congelado; no funciona con `from_pretrained` estándar de Transformers.
- Sin evaluación visual del checkpoint final: el autor confirma que final8580 solo se comprobó en cuanto a estado completo, finalización del entrenamiento, tensores finitos y módulos congelados inalterados.
- Resultados previos no extrapolables: la evaluación de diffusion8100 sobre la escena 00001D no establece el rendimiento de final8580 ni la generalización a test, y la comparación con full30000 no es una ablación causal controlada (incluye 500 actualizaciones adicionales de parámetros completos).
- Errores conocidos en el checkpoint previo: persisten errores en ropa, bordes de piernas y detalle térmico en la reconstrucción.
- Referencias pseudo-reales: la fusión usa pseudo-referencias LRRNet, y parte del texto generado menciona referencias limpias ausentes del contexto de inferencia, lo que puede inducir alucinación en las salidas.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial no está garantizado y debe consultarse con el autor.
- Idiomas y sesgos: no hay información sobre sesgos conocidos ni sobre cobertura idiomática.
- Metadatos con rutas locales: el manifiesto conserva rutas locales originales, lo que puede complicar la portabilidad del checkpoint.
- El autor advierte de que la etapa completada no es una petición para extender el entrenamiento automáticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nonbiuld/ImageFusion-Show-MSRS-SFT-full30500-diffusion10-20261112
- Checkpoint previo (MSRS full-parameter step30500): https://huggingface.co/Nonbiuld/ImageFusion-Show-MSRS-SFT-full-step30500-20261112
- Modelo base: https://huggingface.co/showlab/show-o2-1.5B-HQ
- Repositorio del proyecto: https://github.com/Reborn986/ImageFusion-Show
- Código oficial de Show-o (commit fijado): https://github.com/showlab/Show-o/tree/45a5a2de01d1ebd10cd5864d29310a76476cdf23
