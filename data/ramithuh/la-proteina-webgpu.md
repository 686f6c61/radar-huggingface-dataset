# ramithuh/la-proteina-webgpu

## Resumen

La-proteina-webgpu es una exportación de los pesos del modelo La-Proteina (LD1 + AE1) de NVIDIA DigitalBiology, reempaquetados en safetensors fragmentados en FP16 e INT8 con manifiestos SHA-256, con el objetivo de permitir inferencia íntegramente en el navegador mediante WebGPU. El repositorio lo publica el usuario ramithuh dentro del ecosistema denovo.run y denovo-webgpu-models, y no constituye un modelo nuevo sino una conversión de pesos orientada al despliegue cliente.

El modelo subyacente pertenece a la familia La-Proteina, orientada al diseño generativo de proteínas (modelo de difusión sobre representaciones latentes, con un autoencoder AE1 y un modelo de difusión latente LD1). La información disponible en la model card es muy escasa: no se detallan parámetros totales, longitud de contexto, idiomas ni pipeline, y el repositorio no registra descargas ni interacciones.

Su relevancia actual radica en el enfoque de despliegue: llevar un modelo científico de diseño de proteínas a WebGPU en el navegador, con cuantización INT8 y pesos fragmentados de hasta 25 MB por shard, lo que facilita la distribución y la ejecución sin infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo upstream La-Proteina: difusión latente LD1 + autoencoder AE1, según model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 e INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (código) / NVIDIA Open Model License (pesos) |
| Formato de pesos | safetensors fragmentados (shards de hasta 25 MB, con manifiestos SHA-256) |

## Arquitectura y entrenamiento

La model card identifica el modelo upstream como `NVIDIA DigitalBiology/la-proteina` y describe la exportación como "LD1 + AE1", lo que corresponde a un esquema de difusión latente (LD1) acoplado a un autoencoder (AE1). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta publicación no está en el entrenamiento sino en el empaquetado para inferencia: pesos divididos en shards de 25 MB o menos, en FP16 e INT8, acompañados de manifiestos SHA-256 para verificación de integridad, y exportados específicamente para ejecución en WebGPU dentro del navegador (denovo.run). El repositorio remite a `README_WEBGPU.md` para la arquitectura detallada y los benchmarks de paridad numérica, documento no incluido en la información disponible.

## Capacidades

- Generación y diseño de proteínas mediante el modelo upstream La-Proteina (LD1 + AE1), según la referencia al repositorio de NVIDIA DigitalBiology.
- Inferencia en navegador mediante WebGPU, sin necesidad de backend propio.
- Ejecución con pesos en FP16 e INT8, lo que permite elegir entre mayor fidelidad numérica o menor huella de memoria.
- Verificación de integridad de los shards mediante manifiestos SHA-256.
- No se documentan capacidades de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo; el modelo no es un LLM de propósito general.
- El resto de capacidades específicas (modos de muestreo, condicionamiento, etc.) no están disponibles en la información proporcionada.

## Casos de uso

- Diseño de proteínas en el navegador: un investigador puede cargar los shards en denovo.run y ejecutar el modelo de difusión latente sin instalar CUDA ni configurar un servidor, lo que reduce la barrera de entrada para pruebas exploratorias.
- Demostraciones y docencia: al ejecutarse en WebGPU con shards pequeños, el modelo se puede distribuir en una página web para mostrar generación de proteínas en tiempo real en un portátil con GPU integrada.
- Prototipado rápido de pipelines de biología computacional: los pesos en FP16 e INT8 permiten comparar la paridad numérica frente al modelo original antes de comprometer recursos en un despliegue con GPU dedicada.
- Distribución de artefactos científicos: los manifiestos SHA-256 y la fragmentación en shards de hasta 25 MB facilitan la entrega verificable de pesos a través de CDN y la caché en el navegador.
- Evaluación de cuantización: al ofrecer FP16 e INT8 del mismo modelo, sirve para medir el impacto de la cuantización en la calidad de las proteínas generadas en un entorno cliente.
- Integración en aplicaciones web de investigación colaborativa: equipos distribuidos pueden ejecutar el mismo modelo en local dentro del navegador y compartir únicamente configuraciones y resultados, sin mover los pesos a un servidor central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "numerical parity benchmarks" en `README_WEBGPU.md`, pero dicho documento no se incluye en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,9 GB, por lo que la huella de los pesos es inferior a 1 GB en el conjunto de shards publicados (FP16 e INT8 combinados).
- GPU recomendadas: no disponibles; al tratarse de inferencia WebGPU, requiere un navegador con soporte de WebGPU (Chrome/Edge recientes, Safari en versiones compatibles) y una GPU expuesta a través de esa API.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del repositorio (0,9 GB) y la orientación a navegador, aunque no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: WebGPU en navegador (denovo.run, denovo-webgpu-models); no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| la-proteina-webgpu (esta ficha) | no disponible | no disponible | Apache-2.0 (código) / NVIDIA Open Model License (pesos) | safetensors FP16/INT8 fragmentados | WebGPU en navegador |
| NVIDIA DigitalBiology/la-proteina (upstream) | no disponible | no disponible | NVIDIA Open Model License (pesos) | no disponible | no disponible |
| Otras exportaciones WebGPU de denovo-webgpu-models | no disponible | no disponible | no disponible | safetensors | WebGPU en navegador |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La información publicada es mínima: no hay pipeline, idiomas, número de parámetros ni contexto, lo que impide evaluar el modelo con rigor sin consultar el repositorio upstream.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria ni evidencia de uso en producción.
- La licencia de los pesos es la NVIDIA Open Model License, distinta de la Apache-2.0 del código; es imprescindible revisar `LICENSE` y `WEIGHTS_LICENSE` antes de cualquier uso comercial.
- Al ser una conversión de pesos, cualquier sesgo o limitación del modelo upstream La-Proteina se hereda; no se documentan sesgos específicos.
- La cuantización INT8 puede degradar la fidelidad de las muestras generadas respecto a FP16; la model card remite a benchmarks de paridad que no están disponibles en esta información.
- La inferencia depende de WebGPU: navegadores sin soporte o GPU sin dicha API no podrán ejecutar el modelo.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, razonamiento, código o agentes.
- No se documentan restricciones de contexto ni de idioma porque el modelo no opera sobre texto.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/la-proteina-webgpu
- Modelo upstream: https://huggingface.co/NVIDIA-DigitalBiology/la-proteina
- Repositorio de exportaciones WebGPU: https://github.com/ramithuh/denovo-webgpu-models
- Aplicación: https://denovo.run
