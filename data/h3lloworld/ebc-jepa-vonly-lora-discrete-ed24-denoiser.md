# h3lloworld/ebc-jepa-vonly-lora-discrete-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment vonly_lora_discrete (ED24) es un ajuste fino orientado a la eliminacion de ruido (denoising) en camaras de eventos, publicado por el usuario h3lloworld en HuggingFace. No se trata de un modelo de lenguaje, sino de un modelo de vision sobre secuencias de eventos que parte de un backbone V-JEPA 2.1 ViT-B de Meta y le anade adaptadores LoRA de rango 8 sobre las proyecciones qkv y proj, una proyeccion de tokenizador de eventos y una cabeza por evento (per-event head), con los descriptores desactivados. El objetivo concreto es la limpieza de ruido en flujos de camara de eventos, un dominio con datos dispersos y asincronos donde los modelos basados en RGB no rinden igual.

El modelo forma parte de una linea de experimentos sobre codificacion posicional rotatoria (RoPE) continua frente a discreta, de ahi el sufijo "vonly_lora_discrete". Se entrena sobre la totalidad del conjunto ED24 (los 2.100 ficheros oficiales de EDformer) y se evalua su generalizacion en DND21 y E-MLB. El repositorio es de 0,0 GB y solo contiene los tensores entrenables (`trainable.pt`), las metricas (`metrics.json`) y la configuracion (`config.json`); no incluye los pesos completos, que deben cargarse sobre el checkpoint publico de V-JEPA 2.1 ViT-B.

Su relevancia es acotada y de caracter investigador: se publica bajo licencia MIT, tiene cero descargas y cero "likes" en el momento de redactar esta ficha, y no declara pipeline ni idiomas. Es util como artefacto reproducible para quien trabaje en denoising de camaras de eventos o en adaptacion eficiente (LoRA) de backbones de video auto-supervisados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (backbone V-JEPA 2.1 ViT-B) con adaptadores LoRA (qkv, proj; rango 8) y cabeza por evento |
| Parametros totales | no disponible (backbone ViT-B; solo se publican los tensores entrenables) |
| Longitud de contexto | no aplicable (modelo de vision sobre secuencias de eventos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); `trainable.pt` con solo los tensores entrenados sobre el checkpoint base V-JEPA |

## Arquitectura y entrenamiento

La arquitectura combina el backbone RGB V-JEPA 2.1 ViT-B de Meta con un conjunto reducido de modulos entrenables: una proyeccion de tokenizador de eventos, una cabeza por evento y adaptadores LoRA de rango 8 aplicados a las proyecciones de consulta, clave, valor (qkv) y de salida (proj). Los descriptores quedan desactivados. La configuracion de layout, ventana, readout y modo de RoPE (continuo o discreto) no se detalla en la model card y remite al fichero `config.json`, cuyo contenido no esta disponible en la informacion proporcionada. El experimento se enmarca en una comparativa entre RoPE continuo y discreto, y esta variante corresponde a la rama discreta con LoRA "vonly".

En cuanto al entrenamiento, se emplea el conjunto ED24 en su totalidad (los 2.100 ficheros oficiales de EDformer), y la generalizacion se prueba sobre DND21 y E-MLB. No se especifican el numero de tokens, la composicion detallada del dataset, ni si hubo etapas de RLHF o DPO (poco probables en un modelo de vision de este tipo). El repositorio no incluye pesos completos: `trainable.pt` contiene unicamente los tensores entrenados, que se cargan sobre el checkpoint publico `vjepa2_1_vitb_dist_vitG_384.pt`. La evaluacion se realiza con `tools/lora_denoise/eval_emlb.py`, apuntando a la carpeta que contiene este modelo.

## Capacidades

- Eliminacion de ruido (denoising) en secuencias de camara de eventos.
- Procesamiento de datos de eventos mediante tokenizador especifico y cabeza por evento.
- Adaptacion eficiente de un backbone de video auto-supervisado (V-JEPA 2.1) mediante LoRA de rango 8.
- Extraccion de representaciones sobre el backbone V-JEPA 2.1 ViT-B (RGB) con los modulos de eventos anadidos.
- Evaluacion de generalizacion sobre los conjuntos DND21 y E-MLB.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision especializado.

## Casos de uso

- Limpieza de ruido en grabaciones de camara de eventos: aplicar el modelo para reducir el ruido de fondo en flujos de eventos antes de alimentar etapas posteriores de reconstruccion, deteccion o seguimiento.
- Preprocesado en pipelines de vision por eventos: usarlo como denoiser previo en un sistema de reconocimiento o SLAM basado en eventos, aprovechando que opera directamente sobre la representacion de eventos en lugar de convertirla a fotogramas RGB.
- Investigacion en codificacion posicional: servir como artefacto reproducible para comparar RoPE continuo frente a discreto en un backbone V-JEPA adaptado a eventos.
- Reproduccion de experimentos de adaptacion eficiente: dado que solo se publican los tensores LoRA y las cabezas, permite estudiar el ajuste de bajo rango sobre un backbone congelado sin redistribuir pesos completos.
- Benchmarking de denoising en ED24, DND21 y E-MLB: utilizarlo como punto de comparacion frente a otros denoisers de eventos con el protocolo `eval_emlb.py` y los ficheros `metrics.json`.
- Base para nuevos ajustes: partir de estos tensores entrenados y extenderlos a otros dominios de eventos o a otras variantes de backbone V-JEPA.
- Docencia y prototipado en vision por eventos: ejemplo completo de carga de LoRA sobre un checkpoint publico de V-JEPA 2.1.

## Benchmarks y rendimiento

El repositorio incluye un fichero `metrics.json`, pero sus valores no estan disponibles en la informacion proporcionada. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Al tratarse de un backbone ViT-B (variante base) mas adaptadores LoRA y cabezas ligeras, el consumo deberia ser moderado en FP16, pero no se dispone de cifras oficiales.
- GPU recomendadas: no especificadas en la informacion disponible. Por el tamano del backbone (ViT-B), es plausible su ejecucion en GPU de consumo, pero este extremo no esta confirmado.
- Cabe en GPU de consumo: probable por tratarse de una variante ViT-B con LoRA, aunque no confirmado por el autor.
- Opciones de despliegue: evaluacion mediante el script oficial `tools/lora_denoise/eval_emlb.py` con el checkpoint `vjepa2_1_vitb_dist_vitG_384.pt`. No se documentan integraciones con vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ebc-jepa-vonly-lora-discrete-ed24-denoiser | Denoising de eventos (LoRA) | V-JEPA 2.1 ViT-B | no aplicable | MIT | HuggingFace (solo tensores entrenables) |
| V-JEPA 2.1 ViT-B (Meta) | Backbone de video auto-supervisado | ViT-B | no aplicable | MIT | Checkpoint publico de Meta |
| EDformer (ED24) | Denoising de eventos | no disponible | no aplicable | no disponible | Referencia del dataset ED24 |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con otras alternativas de denoising de eventos.

## Limitaciones y advertencias

- Es un artefacto de investigacion con cero descargas y cero "likes"; no hay evidencia de uso en produccion ni validacion externa.
- No incluye los pesos completos: requiere descargar aparte el checkpoint base `vjepa2_1_vitb_dist_vitG_384.pt` y cargar `trainable.pt` encima, lo que anade dependencia de un fichero externo.
- La model card remite a `config.json` para layout, ventana, readout y modo de RoPE; esos detalles no estan disponibles y son necesarios para reproducir el comportamiento exacto.
- No se documentan sesgos, tasas de alucinacion (concepto poco aplicable a un denoiser), ni limitaciones de idioma (modelo no linguistico).
- Dominio restringido: entrenado sobre ED24 y evaluado en DND21 y E-MLB; su generalizacion a otras camaras, resoluciones o entornos no esta garantizada.
- Licencia MIT, que permite uso comercial, pero al derivar de V-JEPA 2 / 2.1 de Meta conviene verificar las condiciones del checkpoint base antes de un despliegue comercial.
- Formato de pesos en PyTorch (`.pt`), no compatible directamente con runtimes de inferencia estandar para LLM; requiere el codigo del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-vonly-lora-discrete-ed24-denoiser
- Codigo (rama denoise-lora): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Protocolo de tablas (`docs/lora_denoise/HANDOFF.md`): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora/docs/lora_denoise/HANDOFF.md
- Checkpoint base V-JEPA 2.1 ViT-B: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- V-JEPA 2 / 2.1 (Meta): no disponible (no se proporciona URL adicional en la informacion disponible)
