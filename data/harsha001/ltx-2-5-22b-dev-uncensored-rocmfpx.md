# Harsha001/LTX-2.5-22B-dev-uncensored-ROCmFPX

## Resumen

LTX-2.5-22B-dev-uncensored-ROCmFPX es una cuantizacion no oficial del modelo de generacion de video texto-a-video Lightricks/LTX-2.5, publicada por el usuario Harsha001 en Hugging Face. Se trata de una variante "uncensored" (tambien etiquetada como heretic y abliterated), lo que indica que se han aplicado tecnicas de ablacion de direcciones de rechazo para eliminar los filtros de contenido del modelo original. El repositorio cuantiza los pesos en formato GGUF con un esquema propietario denominado ROCmFPX/ROCmFP4, orientado a la ejecucion en GPUs AMD bajo ROCm y en el runtime stable-diffusion.cpp.

El modelo base, LTX-2.5 de Lightricks, es un generador de video a partir de texto de la familia LTX-Video, una arquitectura de difusion con transformer (DiT) disenada para sintetizar clips de video con coherencia temporal. Aunque el identificador del repositorio menciona "22B", el recuento real de parametros reportado en la ficha de safetensors es de 13.115.791.408 parametros (aproximadamente 13,1 mil millones), por lo que la cifra "22B" del nombre no debe tomarse como el tamano efectivo del modelo.

La relevancia de esta ficha radica en que documenta un caso de cuantizacion comunitaria sobre hardware AMD, un nicho poco cubierto por los flujos habituales (mayoritariamente CUDA/GGUF para NVIDIA), y en que combina tres factores sensibles para produccion: licencia restrictiva del modelo base, acceso restringido (gated) y eliminacion de salvaguardas de contenido. Todo ello exige una evaluacion juridica y de seguridad antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion con transformer (DiT) para texto-a-video, heredada de Lightricks/LTX-2.5 |
| Parametros totales | 13.115.791.408 (segun safetensors); el nombre del repo indica "22B" |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFPX / ROCmFP4 (esquema propio del autor), formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (licencia "other" del modelo base) |
| Formato de pesos | GGUF (cuantizado); base en safetensors |
| Tamano del repositorio | 29,4 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en Hugging Face |
| Pipeline | text-to-video |
| Libreria | gguf |
| Descargas / likes | 2.680 / 34 |
| Fecha de creacion | 2026-10-20 |
| Ultima actualizacion | 2026-11-27 |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 pertenece a la familia LTX-Video de Lightricks, que emplea una arquitectura de difusion basada en transformer (DiT) para la generacion de video condicionada por texto. La variante publicada por Harsha001 no aporta informacion sobre el proceso de entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF/DPO o etapas de ajuste fino), por lo que estos datos deben consultarse en la ficha del modelo base Lightricks/LTX-2.5. Lo que si documenta el autor es el proceso de post-procesado: cuantizacion de los pesos a un esquema ROCmFPX/ROCmFP4 empaquetado en GGUF, y aplicacion de tecnicas de "abliteration" (ablacion de direcciones de rechazo en el espacio de activaciones) para eliminar el comportamiento de rechazo de contenido.

La innovacion tecnica destacable de esta publicacion no esta en la arquitectura, sino en el objetivo de despliegue: permitir la inferencia del modelo de video en GPUs AMD mediante ROCm y el runtime stable-diffusion.cpp, un camino alternativo al ecosistema CUDA. No se dispone de informacion sobre metodos de decodificacion especulativa, atencion lineal ni otras optimizaciones internas del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de texto (text-to-video): capacidad principal del pipeline declarado.
- Generacion de clips con coherencia temporal, propia de la familia LTX-Video.
- Comportamiento "uncensored": se han eliminado las salvaguardas de rechazo, por lo que el modelo puede generar contenido que el original bloquearia.
- Ejecucion en GPUs AMD mediante ROCm y stable-diffusion.cpp (objetivo declarado de la cuantizacion).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado de video generativo en hardware AMD: el modelo permite experimentar con generacion texto-a-video en GPUs AMD bajo ROCm, un escenario donde las alternativas suelen requerir CUDA. Adecuado para equipos con infraestructura AMD que quieran validar pipelines de video sin migrar de plataforma.
- Investigacion sobre seguridad y alineacion: al ser una variante abliterated, sirve para estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo y que tipos de contenido emergen, en un entorno controlado y con las salvaguardas organizativas adecuadas.
- Generacion de material de previsualizacion (previz) en produccion audiovisual: clips cortos para storyboards o animaticas, aprovechando la ventana de contexto del modelo base para mantener coherencia entre planos.
- Creacion de contenido creativo sin restricciones editoriales: estudios que necesiten explorar narrativas que los filtros del modelo original bloquearian, asumiendo la responsabilidad legal y etica del contenido generado.
- Benchmarking de cuantizacion en video: comparar la calidad de la cuantizacion ROCmFPX/ROCmFP4 frente al modelo base en safetensors, midiendo degradacion visual y velocidad en GPUs AMD.
- Integracion en pipelines de stable-diffusion.cpp: desplegar generacion de video en entornos ligeros basados en este runtime, con menor dependencia de frameworks pesados.
- Docencia y divulgacion: demostraciones de generacion de video en hardware de consumo AMD, con las advertencias de licencia y contenido correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 29,4 GB, por lo que se requiere al menos esa cantidad de memoria (o descarga por capas) para cargar los pesos cuantizados, mas el overhead del runtime.
- GPU recomendadas: GPUs AMD con soporte ROCm (el autor no especifica modelos concretos); el esquema ROCmFP4 sugiere orientacion a aceleradores AMD con soporte de precision reducida.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repositorio (29,4 GB) supera la VRAM de la mayoria de GPUs de consumo, por lo que probablemente requiera offloading o GPUs profesionales.
- Opciones de despliegue: stable-diffusion.cpp (runtime declarado), ROCm; vLLM, llama.cpp, Ollama y TGI no estan indicados para este modelo de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Harsha001/LTX-2.5-22B-dev-uncensored-ROCmFPX | 13,1 B (segun safetensors) | no disponible | GGUF (ROCmFPX/FP4) | ltx-2.x-community-license-agreement | Gated en Hugging Face |
| Lightricks/LTX-2.5 (base) | no disponible en esta ficha | no disponible | safetensors | ltx-2.x-community-license-agreement | Hugging Face |
| Otras variantes de LTX-Video | no disponible | no disponible | safetensors / GGUF | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: se han eliminado las salvaguardas de contenido, lo que implica riesgo de generar material ilegal, danino o no conforme a politicas si no se aplican filtros externos.
- Licencia restrictiva: la ltx-2.x-community-license-agreement impone condiciones especificas de uso; es imprescindible revisarla antes de cualquier uso comercial o redistribucion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade una capa de control pero no sustituye la revision legal.
- Cuantizacion no oficial: al ser una cuantizacion comunitaria, no hay garantia de calidad, soporte ni paridad con el modelo base; la degradacion visual no esta documentada.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir artefactos, incoherencias temporales y contenido no solicitado.
- Datos incompletos: no se dispone de informacion sobre idiomas, contexto, benchmarks ni requisitos de hardware oficiales.
- Posible discrepancia de parametros: el nombre indica "22B" pero safetensors reporta 13,1 B; conviene verificar el modelo base antes de planificar recursos.
- Uso en produccion: requiere evaluacion de seguridad de contenido, revision de licencia y validacion de calidad especifica para el caso de uso.

## Enlaces

- Hugging Face: https://huggingface.co/Harsha001/LTX-2.5-22B-dev-uncensored-ROCmFPX
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: ltx-2.x-community-license-agreement (referenciada en la ficha del modelo base)
- Runtime stable-diffusion.cpp: no disponible en la informacion proporcionada
- Paper o blog oficial de LTX-2.5: no disponible en la informacion proporcionada
