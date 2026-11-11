# S3ckn11g0r/CROWN-Krea2-Edit-Anime2Real-1to1

## Resumen

CROWN-Krea2-Edit-Anime2Real-1to1 es un LoRA de concepto desarrollado por S3ckn11g0r (NineCrowns, `[CROWN]`) para el modelo base Krea 2, una arquitectura SingleStreamDiT orientada a edicion y generacion de imagenes. Su funcion es convertir ilustraciones anime 2D de trazado plano (cel-shading) en fotografias de aspecto realista manteniendo un alineamiento 1:1 con la imagen de referencia: expresion facial, peinado, ropa, accesorios y composicion del fondo se preservan, mientras que la geometria facial y la textura de la piel se sustituyen por rasgos humanos fotograficos.

El adaptador se entrena a resolucion nativa de 1024x1536 sobre un cluster de 8 GPU NVIDIA B200, con rango 64 y una particion ortogonal en dos subespacios SVD: los rangos 0..31 se encargan del alineamiento espacial pixel a pixel mediante cross-attention, y los rangos 32..63 inyectan estructura osea facial humana, proporciones reales de iris y parpados y microtextura de piel tipo DSLR o iPhone. El resultado se distribuye como un unico fichero `.safetensors` de 435,94 MB pensado para ComfyUI.

Es relevante para flujos de posproduccion y pipelines de conversion anime-a-foto donde se exige fidelidad estructural alta y no solo un cambio de estilo. Esta disenado para funcionar con Krea 2 Turbo en 8 pasos con CFG 1.0, lo que reduce el coste de inferencia frente a configuraciones de muestreo mas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 (SingleStreamDiT); rango 64 con subespacios SVD ortogonales (0..31 alineamiento espacial, 32..63 rasgos humanos realistas) |
| Parametros totales | no disponible (adaptador LoRA; fichero de 435,94 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolucion nativa de entrenamiento 1024x1536) |
| Tipos de cuantizacion | no disponible (se distribuye en un unico `.safetensors`; el modelo base se usa en `bf16`) |
| Idiomas soportados | no disponible (modelo de imagen; las capacidades linguisticas dependen del encoder de texto Qwen3-VL-4B-Instruct) |
| Licencia | bespoke-lora-license (licencia personalizada; enlace a civitai.com/user/NineCrowns) |
| Formato de pesos | safetensors (`CROWN_Krea2_Edit_Anime2Real_1to1_V1_r64.safetensors`, SHA256 `9DA5C81FE0630347D8F573DDF558E720953339FAD4DACD14E37B4164CC5B6FD8`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre Krea 2, un transformer de difusion SingleStreamDiT. El entrenamiento se realizo a 1024x1536 nativo en un cluster de 8x NVIDIA B200 con rango 64. La innovacion principal es la construccion de un subespacio SVD hibrido y ortogonal: los rangos 0..31 se reservan para bloquear la correspondencia espacial 1:1 en la cross-attention (partiendo de la base Apache-2.0 `krea2:o_edit_turbo`), mientras que los rangos 32..63 inyectan exclusivamente rasgos de anatomia facial humana real (estructura osea de Asia Oriental, proporcion de iris y parpados, microtextura de piel y poros, scattering sub-superficial y hebras de pelo individuales).

El condicionamiento de referencia es de doble via: por un lado, caracteristicas vision-texto apiladas en 12 capas de Qwen3-VL-4B-Instruct; por otro, latentes de referencia del VAE de Qwen-Image con `index_timestep_zero` y `isolate_refs=True`. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, dado que se trata de un adaptador de concepto y no de un modelo base.

## Capacidades

- Redibujado fotorealista de ilustraciones anime 2D, sustituyendo cel-shading por textura de piel, poros y scattering sub-superficial.
- Preservacion 1:1 de la expresion facial (boca cerrada o sonrisa), geometria de flequillo, coleta o mono, cintas de cuello, sombreros, bufandas y estetoscopios.
- Mantenimiento de la composicion del fondo y del esquema de iluminacion de la imagen original.
- Conversion de rasgos estilizados en anatomia humana realista: proporcion de iris y parpados, puente nasal, mandibula y lineas de cabello individuales.
- Generacion texto-a-imagen en el pipeline `text-to-image` declarado en el repo, ademas del modo edicion.
- Compatibilidad con Krea 2 Turbo en 8 pasos, CFG 1.0 y `mu` 1.15 (o `beta57`), con peso de LoRA recomendado entre 0.95 y 1.00.
- Soporte de tooling en ComfyUI mediante `ComfyUI-Krea2-Ostris-Edit`, con `FluxKontextMultiReferenceLatentMethod = index_timestep_zero` y `Krea2OstrisEditModelPatch = True`.
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento extendido; son ajenas al proposito del adaptador.

## Casos de uso

- Conversion anime-a-foto para produccion audiovisual: dado un storyboard o keyframe en estilo anime, el LoRA genera una referencia fotografica con la misma composicion y vestuario, util para previsualizacion en rodajes de accion real.
- Adaptacion de personajes de manga o webtoon a casting fotografico: se preservan rasgos como el corte de pelo, el uniforme o los accesorios (cintas, sombreros, estetoscopios) para presentar al equipo de direccion una version live-action coherente con el diseno original.
- Generacion de material promocional para franquicias: a partir de ilustraciones oficiales se obtienen variantes fotograficas 1:1 para campanas, manteniendo la identidad visual del personaje sin redibujar manualmente.
- Creacion de assets para videojuegos con doble estetica: un mismo personaje puede disponer de version cel-shaded y version fotorealista con encaje geometrico exacto, simplificando la coherencia entre cinematicas y gameplay.
- Pruebas de vestuario y maquillaje virtuales: al conservar expresion y geometria de la ropa, sirve para iterar sobre variantes de indumentaria o iluminacion antes de una sesion fotografica real.
- Restauracion estilistica de ilustraciones antiguas: convierte arte 2D de baja fidelidad en referencias fotograficas actualizadas sin alterar el encuadre ni la pose originales.
- Integracion en pipelines ComfyUI de posproduccion: al ser un unico `.safetensors` compatible con Krea 2 Turbo en 8 pasos, se puede encadenar en grafos por lotes con coste de muestreo bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia comparaciones visuales cualitativas (8 showcases) generadas con peso de LoRA 1.00, sin metricas numericas como FID, CLIP score, SSIM ni LPIPS frente a la imagen de referencia.

## Requisitos de hardware

- El adaptador LoRA ocupa 435,94 MB en disco; requiere ademas el modelo base Krea 2 (`krea2_turbo_bf16.safetensors` o `krea2_raw_bf16.safetensors`), el encoder `Qwen3-VL-4B-Instruct` y el VAE `qwen_image_vae.safetensors`.
- No se especifica en la informacion disponible la VRAM exacta necesaria para inferencia. El modelo base se distribuye en `bf16` y el entrenamiento se realizo en 8x NVIDIA B200, por lo que se recomienda GPU de datacenter (B200, H100, A100) para el modo `raw` a 1024x1536.
- No se confirma compatibilidad con GPU de consumo. El uso de Krea 2 Turbo en 8 pasos con CFG 1.0 reduce el coste frente a muestreos largos, pero la viabilidad en RTX 4090 u otras tarjetas consumer no esta documentada.
- Opciones de despliegue documentadas: ComfyUI con el nodo `ComfyUI-Krea2-Ostris-Edit`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: no disponibles. La model card solo indica "segundos" para la generacion con Krea 2 Turbo a 8 pasos, sin cifras concretas de tiempo por imagen ni imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CROWN-Krea2-Edit-Anime2Real-1to1 | LoRA de edicion sobre Krea 2 (SingleStreamDiT) | no disponible (adaptador de 435,94 MB) | 1024x1536 nativo | bespoke-lora-license | Hugging Face, Civitai, RunningHub |
| Krea 2 (base) | SingleStreamDiT | no disponible | no disponible | no disponible | Referenciado como dependencia |
| Qwen3-VL-4B-Instruct | Vision-language encoder | 4B | no disponible | no disponible | Usado como encoder de referencia |
| Qwen-Image-VAE | VAE | no disponible | no disponible | no disponible | Usado para latentes de referencia |

No se dispone de informacion sobre otros LoRA comparables de conversion anime-a-real en la busqueda realizada; los resultados web obtenidos no contienen datos tecnicos relevantes.

## Limitaciones y advertencias

- La licencia `bespoke-lora-license` es personalizada y remite a civitai.com/user/NineCrowns; no se detallan en la informacion disponible las condiciones exactas de uso comercial, redistribucion o atribucion. Es imprescindible revisar el texto completo antes de usarlo en produccion.
- El adaptador esta especializado en rostros de Asia Oriental segun la propia model card ("East Asian facial bone structure"); su comportamiento en otros fenotipos no esta documentado y puede introducir sesgos de representacion.
- El alineamiento 1:1 depende de la calidad y del encuadre de la imagen de referencia; entradas con poses extremas, oclusiones o estilos muy alejados del cel-shading pueden degradar la preservacion de expresion, ropa o fondo.
- Riesgo de alucinacion visual: el LoRA puede inventar detalles de piel, pelo o iluminacion no presentes en la referencia al forzar el realismo.
- Requiere una cadena de dependencias concreta (Krea 2 Turbo o Raw, Qwen3-VL-4B-Instruct, Qwen-Image-VAE y el nodo `ComfyUI-Krea2-Ostris-Edit`); desviarse de los parametros recomendados (8 pasos, CFG 1.0, `mu` 1.15, peso 0.95-1.00) puede producir resultados inconsistentes.
- No hay datos publicos de benchmarks, latencia ni consumo de VRAM, lo que dificulta estimar costes de produccion.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente del comportamiento del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-Krea2-Edit-Anime2Real-1to1
- Civitai (modelo): https://civitai.com/models/3046363
- Civitai (perfil del autor): https://civitai.com/user/NineCrowns
- RunningHub Online Cloud: https://www.runninghub.ai/model/public/2120440913309995010
