# h3lloworld/ebc-jepa-rope-xattn16-desc-disc-s1-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment rope_xattn16_desc_disc_s1 (ED24) es un modelo de investigacion orientado al denoising de camaras de eventos, publicado por el usuario h3lloworld. No es un modelo de lenguaje: se trata de un denoiser de vision construido sobre el backbone V-JEPA 2.1 ViT-B de Meta, al que se anaden adaptadores LoRA (rango 8) sobre las proyecciones qkv y proj, una proyeccion especifica de tokenizador de eventos y una cabeza (head) por evento. En esta variante los descriptores estan desactivados.

El modelo forma parte de un experimento de codificacion posicional rotatoria (RoPE) que compara la modalidad continua frente a la discreta (rope_xattn16_desc_disc_s1). Se entrena sobre el conjunto completo ED24 (basado en EDformer, los 2.100 ficheros oficiales) y su generalizacion se evalua en DND21 y E-MLB. La relevancia reside en estudiar como el tipo de RoPE y la atencion cruzada (cross-attention 16) afectan al filtrado de ruido en flujos de eventos, un problema central en vision neuromorfica.

El repositorio publica unicamente los tensores entrenados (`trainable.pt`), las metricas y la configuracion; los pesos base de V-JEPA 2.1 deben descargarse por separado. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision V-JEPA 2.1 ViT-B con adaptadores LoRA (qkv y proj, rango 8), cabeza por evento y proyeccion de tokenizador de eventos |
| Parametros totales | no disponible (backbone ViT-B de V-JEPA 2.1; los pesos publicados son solo los tensores entrenados: proyeccion del tokenizador, cabeza y LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de eventos; definida en `config.json`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch); requiere el checkpoint base `vjepa2_1_vitb_dist_vitG_384.pt` |

## Arquitectura y entrenamiento

La arquitectura parte del backbone V-JEPA 2.1 ViT-B de Meta, un transformer de vision preentrenado con el objetivo de prediccion conjunta de embeddings (JEPA) sobre video. Sobre el se aplican adaptadores LoRA de rango 8 en las proyecciones de consulta, clave, valor (qkv) y en la proyeccion de salida. El modelo incorpora ademas una proyeccion de tokenizador especifica para eventos y una cabeza por evento, con los descriptores desactivados en esta variante. El modo de RoPE (continuo frente a discreto), la disposicion, la ventana y el mecanismo de lectura se especifican en `config.json`.

El entrenamiento utiliza el conjunto ED24, derivado de EDformer, empleando los 2.100 ficheros oficiales completos. La generalizacion se prueba en DND21 y E-MLB. El modelo se distribuye como un conjunto de tensores que se cargan sobre el checkpoint publico de V-JEPA 2.1, de modo que el ajuste grueso corresponde al preentrenamiento de Meta y el ajuste fino a los pesos LoRA y la cabeza por evento. No se detalla en la informacion disponible si hubo etapas de RLHF, DPO u otro tipo de alineacion, ni el numero de tokens o eventos de entrenamiento.

## Capacidades

- Denoising de flujos de eventos: filtrado de ruido en datos de camaras de eventos.
- Extraccion de representaciones sobre video RGB mediante el backbone V-JEPA 2.1 ViT-B.
- Tokenizacion de eventos mediante una proyeccion dedicada.
- Clasificacion o prediccion por evento a traves de la cabeza especifica.
- Adaptacion de bajo coste (LoRA r8) sobre un backbone congelado.
- Variante experimental de RoPE (continua frente a discreta) y atencion cruzada 16.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni procesamiento de lenguaje.

## Casos de uso

- Preprocesado de datos en vision neuromorfica: limpiar flujos de eventos antes de alimentar otros modelos (por ejemplo, deteccion o SLAM), reduciendo el ruido que degrada tareas posteriores.
- Robotica de baja latencia: las camaras de eventos ofrecen alta resolucion temporal; aplicar este denoiser permite mantener la ventaja temporal sin que el ruido falsee la percepcion.
- Vehiculos autonomos y ADAS: filtrado de eventos en escenas con movimiento rapido o condiciones de iluminacion dificiles, donde el ruido del sensor es mas pronunciado.
- Drones y plataformas con computo limitado: al ser un ViT-B con LoRA, el coste de inferencia es contenido y puede integrarse en sistemas embebidos con GPU moderada.
- Investigacion comparativa de RoPE: usar la variante como brazo de control en estudios sobre codificacion posicional en transformers de vision para eventos.
- Generacion de datasets limpios: emplear el modelo para crear versiones denoised de ED24, DND21 o E-MLB destinadas a entrenar otros modelos.
- Vigilancia y seguimiento de alta velocidad: mejorar la relacion senal-ruido en escenas nocturnas o de bajo contraste captadas con sensores de eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics.json` y la model card menciona un protocolo de tablas en `docs/lora_denoise/HANDOFF.md`, ademas de pruebas de generalizacion sobre DND21 y E-MLB, pero no se facilitan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Al apoyarse en un backbone ViT-B (del orden de 86 M de parametros en su configuracion estandar) mas adaptadores LoRA de rango 8, el peso del modelo en precision completa es reducido y la inferencia cabe con holgura en GPU de consumo.
- GPU recomendadas: no disponibles de forma especifica. Por tamano de backbone, cualquier GPU consumer reciente con 6-8 GB o mas de VRAM seria suficiente; GPU de datacenter (A100, H100) solo serian necesarias para lotes grandes o entrenamiento.
- Cabe en GPU consumer: si, previsiblemente en modelos tipo RTX 3060, 4060, 4090 y equivalentes, dado el tamano del backbone y el uso de LoRA.
- Opciones de despliegue: el flujo documentado usa PyTorch con el script `tools/lora_denoise/eval_emlb.py`. No se indican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones comparables de otros modelos en la informacion proporcionada. Como referencias de categoria se pueden citar el dataset y metodo EDformer (origen de ED24, empleado como datos de entrenamiento) y los conjuntos de evaluacion DND21 y E-MLB, pero no se facilitan sus cifras de parametros, contexto o rendimiento para una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBC-JEPA rope_xattn16_desc_disc_s1 (ED24) | no disponible (backbone ViT-B + LoRA) | no disponible | no disponible | MIT | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigacion con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion externa.
- Requiere descargar por separado el checkpoint base de V-JEPA 2.1; no es autonomo.
- No se publican cifras de benchmarks ni de rendimiento, por lo que no puede verificarse su calidad frente a alternativas.
- El modelo esta especializado en denoising de camaras de eventos; no procesa lenguaje ni tareas de texto, por lo que las limitaciones de idioma no aplican.
- No se documentan sesgos, tasas de alucinacion ni comportamiento fuera de dominio; se desconoce su robustez ante distribuciones distintas de ED24.
- Los descriptores estan desactivados en esta variante concreta, lo que puede restringir su comportamiento frente a otras configuraciones del mismo experimento.
- Licencia MIT en los pesos publicados, heredada del marco V-JEPA 2/2.1 de Meta (tambien MIT); conviene verificar la procedencia y los terminos del dataset ED24 para uso comercial.
- La fecha de creacion del repositorio (2026) y la ausencia de documentacion adicional dificultan evaluar su mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-xattn16-desc-disc-s1-ed24-denoiser
- Codigo (rama denoise-lora): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Protocolo de tablas: `docs/lora_denoise/HANDOFF.md` (dentro del repositorio anterior)
- Checkpoint base V-JEPA 2.1 ViT-B: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- Script de evaluacion: `tools/lora_denoise/eval_emlb.py` (dentro del repositorio de codigo)
