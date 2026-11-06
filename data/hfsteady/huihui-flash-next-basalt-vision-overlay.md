# hfsteady/Huihui-Flash-Next-Basalt-Vision-Overlay

## Resumen

Huihui-Flash-Next-Basalt-Vision-Overlay es un complemento experimental de vision publicado por el usuario hfsteady en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un paquete que contiene un proyector multimodal (mmproj) empaquetado en formato GGUF y un conjunto de metadatos (manifest.json, checksums.json) destinados a inyectar capacidad de comprension de imagenes en un artefacto de texto preexistente denominado Basalt. El proyector se copia byte a byte desde el repositorio oficial huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF, sin recuantizar, y los tensores de lenguaje no se descargan ni se modifican.

El interes del paquete es acotado y muy tecnico: sirve como capa opt-in para un runtime Basalt (integracion experimental sobre el loader de jesdga95/basalt) que permite activar vision dinamica con contexto de 262144 tokens, KV en INT8 y decodificacion especulativa spec3. El propio autor advierte que la validacion en GPU, las pruebas de imagen con contexto largo y el enrutado privado de imagenes via Hermes siguen pendientes, por lo que no debe considerarse un modelo listo para produccion.

Por su naturaleza (overlay de vision sin pesos de lenguaje, repositorio de 0.9 GB y cero descargas), esta ficha describe un artefacto de integracion mas que un modelo evaluable de forma autonoma. La licencia declarada es Qwen Community License 1.0, heredada del proyector upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) para modelo de lenguaje Qwen3.8-Flash-Next; no incluye arquitectura de lenguaje propia |
| Parametros totales | no disponible (el overlay solo contiene el proyector y metadatos; los pesos de lenguaje residen en el artefacto Basalt base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262144 tokens (segun instrucciones de prueba del autor; aplicable al modelo de texto base, no al overlay) |
| Tipos de cuantizacion | Proyector en BF16 (mmproj BF16, 907543008 bytes); KV cache INT8 en la configuracion de prueba; el paquete no recuantiza |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0; tag license: other) |
| Formato de pesos | GGUF (proyector mmproj y tokenizer en GGUF solo de metadatos); manifiesto y checksums en JSON |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo. Se compone de tres piezas: un proyector multimodal BF16 (mmproj-Qwen3.8-Flash-Next-BF16.gguf, SHA256 b1a82259702816a5330d7bd7607cd9676b11780e79ff7348c21103ff3ce49bd0) copiado sin modificacion desde el repositorio oficial de huihui-ai en la revision 411f1f7349c9711e6f75aa8d20e1612eb3a4d55d; un GGUF de tokenizer convertido a metadatos unicamente; y un manifest.json que vincula el overlay al digest de metadatos, tamano, IDs de marcadores de imagen y geometria del proyector del pack de texto Basalt (revision db74026775af2ee80366d4f6172b16f838b2a933). Los tensores de lenguaje no se descargan, modifican, copian ni suben en esta build.

La innovacion tecnica no esta en el modelo sino en el mecanismo de integracion: un hook opt-in instalado mediante install-vision-overlay.py sobre el loader de Basalt (commit 463d92e8edf18cf93839bf4cce541ddf7b073280), activado por la variable de entorno BASALT_VISION_OVERLAY_MANIFEST y el modo server.vision="dynamic". El diseno falla en cerrado (fail closed) ante ficheros ausentes, metadatos incorrectos, hashes o IDs de marcador inconsistentes. No se documenta composicion de dataset, numero de tokens de entrenamiento ni fases de RLHF/DPO, ya que el overlay no entrena.

## Capacidades

- Inyeccion de vision en un modelo de texto Basalt preexistente mediante proyector BF16, siempre que el pack de texto base coincida con el manifest.
- Procesamiento de imagenes con contexto de hasta 262144 tokens en la configuracion de prueba indicada por el autor (vision dinamica, KV INT8, spec3).
- Enrutado de imagenes nativo via Hermes: pendiente de validacion segun la model card.
- Compatibilidad con endpoints declarada en los tags del repositorio, aunque el instalador no publica ningun endpoint por si mismo.
- Soporte conversacional (tag conversational) heredado del modelo base.
- Tool calling y function calling: no disponible como capacidad verificada del overlay; depende del modelo de texto base.
- Capacidades de agente y razonamiento multi-paso: no disponibles en el overlay; dependen del modelo de texto base.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Validacion de integracion multimodal en laboratorio: restaurar el pack de texto Basalt, verificar checksums, instalar el hook y comprobar con imagenes sinteticas que el proyector se carga correctamente antes de abordar pruebas reales. Es el unico uso que el autor respalda explicitamente.
- Pruebas de estres de contexto largo con imagenes: ejecutar la configuracion de 262144 tokens con vision dinamica para medir consumo de VRAM y latencia del proyector en GPUs sm120 (CUDA 13) antes de comprometer recursos en produccion.
- Auditoria de cadena de suministro de modelos: el par manifest.json/checksums.json permite verificar de forma reproducible que el proyector corresponde byte a byte al upstream y que los tensores de lenguaje no han sido alterados, util en pipelines de compliance.
- Desarrollo de hooks en loaders alternativos: servir como referencia para implementar integraciones opt-in de vision en otros runtimes basados en llama.cpp/Basalt, dado que el codigo de instalacion y el esquema de manifiesto son publicos.
- Evaluacion comparativa de proyectores: al no recuantizar, permite aislar el efecto del proyector BF16 original frente a variantes recuantizadas en pruebas controladas de calidad de imagen.
- Entornos de investigacion con datos sinteticos: el autor prohibe usar documentos privados para validar el overlay, por lo que encaja en experimentacion con corpus sinteticos o publicos en fases tempranas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la validacion en GPU, las pruebas de imagen con contexto de 262144 tokens y el enrutado privado de imagenes via Hermes siguen pendientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el overlay de forma aislada; el consumo dominante corresponde al modelo de texto Basalt base, cuyos requisitos deben consultarse en su propio manifiesto. El proyector BF16 ocupa aproximadamente 0.9 GB en disco.
- GPU recomendadas: el runtime de referencia se documenta para CUDA 13 y arquitectura sm120 (serie RTX 5090), segun las instrucciones de restauracion del autor.
- Compatibilidad con GPU de consumo: no confirmada; la validacion en GPU esta pendiente segun la model card.
- Opciones de despliegue: runtime Basalt con el hook install-vision-overlay.py y el loader de jesdga95/basalt; no se documenta soporte para vLLM, llama.cpp estandar, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Flash-Next-Basalt-Vision-Overlay | Overlay de vision (proyector + metadatos) | no disponible (solo proyector BF16) | 262144 (config. de prueba) | Qwen Community License 1.0 | Hugging Face, 0 descargas |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | Modelo completo con proyector upstream | no disponible | no disponible | Qwen Community License 1.0 | Hugging Face (fuente del proyector) |
| hfsteady/Huihui-Flash-Next-RadixArk-NVFP4-Basalt-RTX5090 | Pack de texto Basalt (modelo base del overlay) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: es un add-on de vision que requiere el pack de texto Basalt y su runtime para funcionar.
- La validacion en GPU, las pruebas de imagen a 262144 tokens y el enrutado Hermes estan pendientes; el autor desaconseja usarlo con documentos privados.
- La comprobacion de integridad local y los checksums no garantizan compatibilidad en tiempo de ejecucion ni calidad de comprension de imagenes.
- El hook del loader es una integracion experimental y no una garantia del proyecto upstream Basalt.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para este overlay.
- Restricciones de licencia: Qwen Community License 1.0 con posibles obligaciones de atribucion y condiciones de uso comercial; el enlace LICENSE del repositorio upstream faltaba en el momento del ensamblado y el incluido se obtuvo del Qwen base, con la revision fijada en license-source.json.
- El instalador no arranca servidores, no aprovisiona GPU ni publica endpoints; cualquier despliegue corre a cargo del usuario.
- La verificacion SHA256 del pack base debe realizarse de forma independiente durante la restauracion; el emparejamiento de metadatos no valida todos los tensores de lenguaje.
- Idiomas soportados no documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hfsteady/Huihui-Flash-Next-Basalt-Vision-Overlay
- Proyector upstream: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Pack de texto Basalt base: https://huggingface.co/hfsteady/Huihui-Flash-Next-RadixArk-NVFP4-Basalt-RTX5090
- Repositorio Basalt: https://github.com/jesdga95/basalt
