# my-app-s/clip_l.safetensors

## Resumen

`clip_l.safetensors` es un artefacto de pesos en formato safetensors publicado por el usuario `my-app-s` dentro de lo que denomina "Daniel Media Studio archive". No se trata de un modelo completo con pipeline de inferencia propio, sino de un componente aislado: el codificador de texto CLIP-L que forma parte del conjunto de ficheros necesarios para ejecutar el modelo de generación de vídeo HunyuanVideo. El autor lo separa en un repositorio independiente para dejar trazabilidad del fichero, su procedencia, estado de licencia y notas de uso en una sola página.

El fichero pesa 246.144.152 bytes (aproximadamente 0,2 GB) y su procedencia declarada es un repack de Comfy-Org del modelo HunyuanVideo de Tencent, con atribución a THL A29 Limited. Es decir, este repositorio no aporta pesos nuevos ni un modelo entrenado por `my-app-s`: redistribuye un componente ya existente del ecosistema HunyuanVideo.

Su relevancia es, por tanto, operativa y no investigadora. Resulta útil para quienes reconstruyen flujos de trabajo de generación de vídeo en ComfyUI o en el ecosistema DMS y necesitan localizar el codificador de texto CLIP-L concreto con el que se entrenó y evaluó HunyuanVideo. No debe confundirse con un modelo de lenguaje o de visión autónomo: sin el modelo base, el VAE, el tokenizador y los ficheros complementarios, el artefacto no es funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto CLIP-L (componente de un pipeline de difusión de vídeo); arquitectura interna exacta no disponible |
| Parametros totales | no disponible (el fichero pesa 246.144.152 bytes, compatible con un CLIP-L de ~123M parámetros en fp16, aunque el dato no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye en safetensors, presumiblemente en precisión nativa |
| Idiomas soportados | no disponible (el codificador CLIP-L original está entrenado principalmente en inglés; el autor no declara idiomas) |
| Licencia | Tencent Hunyuan Community License (registrada como `other`), con restricciones territoriales y de uso |
| Formato de pesos | safetensors |
| SHA-256 | `660c6f5b1abae9dc498ac2d21e1347d2abdb0cf6c0c0c8576cd796491d9a6cdd` |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El artefacto corresponde al codificador de texto CLIP-L empleado por HunyuanVideo, el modelo de generación de vídeo de Tencent. CLIP-L es un transformer de tipo ViT-L/14 en su variante de texto, que proyecta prompts en un espacio latente alineado con el espacio visual del modelo de difusión. En el pipeline de HunyuanVideo, este codificador se combina con un segundo codificador de texto basado en LLaVA-Llama-3 (referenciado en las URLs de origen como `llava_llama3_fp8_scaled.safetensors`), de modo que CLIP-L aporta una representación semántica complementaria a la del LLM.

No se dispone de información sobre el proceso de entrenamiento específico de este fichero: ni número de tokens, ni composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias, porque el repositorio no introduce ninguna: es una copia de un componente upstream empaquetada por Comfy-Org y redistribuida por `my-app-s`. Cualquier detalle arquitectónico relevante debe consultarse en la documentación original de HunyuanVideo y de CLIP.

## Capacidades

- Codificación de texto para condicionamiento de un pipeline de difusión de vídeo: transforma prompts en embeddings utilizables por HunyuanVideo.
- Componente auxiliar, no autónomo: no genera texto, imágenes ni vídeo por sí mismo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidades multilingües no declaradas; el CLIP-L original está orientado al inglés.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.
- Requiere ficheros complementarios (modelo base, VAE, tokenizador, segundo codificador de texto) para ser funcional.

## Casos de uso

- Reconstrucción de pipelines de HunyuanVideo en ComfyUI: el fichero se coloca en el directorio de codificadores de texto esperado por el flujo de trabajo y permite cargar el pipeline completo con el modelo base y el VAE correspondientes.
- Archivado y trazabilidad de artefactos: el repositorio conserva el SHA-256 y la atribución upstream, lo que facilita auditorías de procedencia en entornos con requisitos de compliance.
- Despliegue de generación de vídeo texto-a-vídeo en local: integrado en el grafo de nodos de ComfyUI, sirve como codificador de texto junto al codificador LLaVA-Llama-3 para producir vídeo a partir de prompts.
- Reproducibilidad de experimentos: al fijar la versión exacta del codificador, se evitan derivas por actualizaciones silenciosas de los pesos en los repositorios upstream.
- Espejo interno de dependencias: organizaciones que no pueden acceder directamente a Hugging Face pueden alojar este artefacto en su infraestructura y servir la dependencia desde ahí.
- Formación y documentación: útil para explicar la composición modular de los pipelines de difusión de vídeo, separando codificador de texto, VAE y modelo de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un componente de un pipeline y no de un modelo evaluable de forma aislada, no procede comparar métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el codificador aislado ocupa aproximadamente 0,25 GB en pesos; en ejecución completa del pipeline de HunyuanVideo, el consumo vendrá dominado por el modelo de difusión y el VAE, no por este fichero.
- GPU recomendadas: no disponible para este artefacto concreto; para el pipeline completo de HunyuanVideo se requiere hardware de gama alta (no especificado en la información proporcionada).
- Cabe en cualquier GPU consumer moderna con holgura, dado el reducido tamaño del fichero, aunque no es útil sin el resto del pipeline.
- Opciones de despliegue: ComfyUI y flujos de trabajo DMS compatibles; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `my-app-s/clip_l.safetensors` | Codificador de texto CLIP-L (componente) | no disponible | no disponible | Tencent Hunyuan Community License | Hugging Face, 0 descargas |
| `Comfy-Org/HunyuanVideo_repackaged` (origen) | Repack completo de HunyuanVideo | no disponible | no disponible | Tencent Hunyuan Community License | Hugging Face |
| Codificador de texto LLaVA-Llama-3 (`llava_llama3_fp8_scaled.safetensors`) | Codificador de texto basado en LLM | no disponible | no disponible | Tencent Hunyuan Community License | Hugging Face (mismo repack) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base, VAE, tokenizador y codificador complementario, el fichero no produce resultados.
- La licencia Tencent Hunyuan Community License impone restricciones territoriales y de uso; es obligatorio revisar `LICENSE.txt` y la documentación upstream antes de cualquier uso comercial.
- El autor no declara idiomas soportados; el CLIP-L original está orientado al inglés, por lo que el rendimiento con prompts en castellano puede degradarse.
- Riesgo de alucinación y sesgos: no evaluables en este artefacto de forma aislada; dependen del pipeline completo y del codificador LLaVA-Llama-3.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de uso comunitario ni de validación independiente.
- El autor no reclama propiedad sobre los materiales upstream; la atribución corresponde a Comfy-Org y a Tencent (THL A29 Limited).
- No se garantiza que el fichero sea idéntico byte a byte al original más allá del SHA-256 declarado, que conviene verificar antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/my-app-s/clip_l.safetensors
- Repositorio de origen (repack de Comfy-Org): https://huggingface.co/Comfy-Org/HunyuanVideo_repackaged
- Fichero original CLIP-L: https://huggingface.co/Comfy-Org/HunyuanVideo_repackaged/resolve/main/split_files/text_encoders/clip_l.safetensors
- Codificador de texto complementario LLaVA-Llama-3: https://huggingface.co/Comfy-Org/HunyuanVideo_repackaged/resolve/main/split_files/text_encoders/llava_llama3_fp8_scaled.safetensors
