# AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A16 es una conversión cuantizada del checkpoint oficial deepseek-ai/DeepSeek-OCR-2, publicada por AutomatosX. Se trata de un modelo multimodal de tipo imagen-a-texto orientado a OCR, construido sobre la arquitectura deepseek_vl_v2 y distribuido en formato NVFP4 W4A16 bajo la interfaz compressed-tensors, lista para servirse con vLLM. El checkpoint original tiene 3.389.119.360 parámetros; la conversión reduce el payload publicado a 3.037.542.952 bytes (unos 3,04 GB), con 2.602.844.160 parámetros almacenados en NVFP4 sobre 2.196 tensores.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de una *development preview*, no de un artefacto certificado. El autor indica que no se añade ninguna garantía de calidad, de exactitud MTP, de velocidad ni de certificación. La conversión se hizo con el codificador nativo AXQuant en modo *round-to-nearest* (RTN), sin usar AWQ en ningún punto del proceso, y el autor remite a un sucesor W4A4 calibrado para quienes necesiten computación FP4 nativa.

El interés técnico está en el empaquetado: pesos en FP4 (E2M1) con escalas de bloque E4M3FN cada 16 valores y una escala global FP32 inversa, mientras que las activaciones siguen ejecutándose en BF16. Componentes críticos como SAM, el codificador visual Qwen2, el proyector, los separadores, los routers, los embeddings, las normas y la LM head conservan sus payloads BF16 originales, lo que protege 511 tensores de la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | deepseek_vl_v2 (multimodal imagen-texto, con codificadores visuales SAM y Qwen2, proyector y decodificador de lenguaje con expertos) |
| Parámetros totales | 3.389.119.360 (checkpoint original) |
| Parámetros activos | no disponible (el modelo base emplea expertos; no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A16: pesos E2M1 FP4, escalas de bloque E4M3FN cada 16 valores, escala global FP32 inversa; activaciones en BF16 sin cuantizar; 511 tensores protegidos en BF16; interfaz compressed-tensors NVFP4A16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, librería vllm) |

Datos adicionales del artefacto: 2.602.844.160 parámetros en NVFP4 repartidos en 2.196 tensores; 511 tensores de precisión de origen protegidos, verificados en dtype e igualdad de valor; 3.037.542.952 bytes de pesos finales (aproximadamente 3,04 GB / 2,83 GiB); carga útil nominal de 4,5 bits por valor más una escala FP32 por matriz, aunque los tensores BF16 protegidos elevan el total de bits por parámetro del checkpoint. Tamaño del repositorio: 3,0 GB. Descargas: 41. Likes: 0. Creado el 2026-10-04 y actualizado el 2026-10-06.

## Arquitectura y entrenamiento

No se publica información sobre el entrenamiento en la documentación disponible. Lo que sí se detalla es el proceso de conversión: el checkpoint DeepSeek-OCR-2 original en BF16 (revisión inmutable aaa02f3811945a91062062994c5c4a3f4c0af2b0, Apache-2.0) se convirtió con el codificador explícito AXQuant `numpy-reference`, aplicando empaquetado NVFP4 *round-to-nearest*. El SHA-256 del peso original coincidía con el objeto LFS fijado en el Hub. El codificador CUDA nativo se verificó aparte para paridad de bytes en RTX 5090 y en Thor, y el manifiesto identifica el codificador de fábrica realmente empleado.

La innovación relevante es la selección de qué se cuantiza y qué no. Se aplica NVFP4 W4A16 a proyecciones seleccionadas de atención, MLP y expertos individuales, mientras que SAM, el codificador visual Qwen2, el proyector, los separadores, los routers, los embeddings, las normas y la LM head mantienen sus payloads BF16 originales. Las proyecciones paralelas Q/K/V y gate/up comparten escalas globales para permitir la fusión en tiempo de ejecución. El paquete usa la interfaz pública compressed-tensors NVFP4A16 y mantiene el layout y la configuración PyTorch oficiales del origen. Los kernels NVFP4 empleados en las pruebas fueron `MarlinNvFp4LinearKernel` y `MARLIN` para MoE.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes de documentos: el pipeline declarado es `image-text-to-text` y la prueba de humo oficial reconoce líneas de una página generada.
- Generación de texto a partir de imágenes (image-to-text) mediante el decodificador de lenguaje del modelo base.
- Procesamiento multimodal con doble codificador visual (SAM y Qwen2) más proyector, conservados en BF16.
- Ejecución con procesadores OCR nativos de vLLM, atención visual Torch SDPA y atención de texto Triton.
- Soporte de *chunked prefill* en la configuración de ejemplo corregida.
- Muestreo determinista en el script de ejemplo (mínimo de 16 tokens) y rechazo de líneas de salida repetidas no vacías.
- Capacidades adicionales del modelo base (tool calling, agentes, multilingüismo, *thinking mode*, contexto exacto) no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: el script de ejemplo del propio repositorio reconoce una página con las cadenas `AXQuant NVFP4`, `Invoice 12345` y `Total USD 42.50`, un escenario representativo de extracción de campos en documentos contables.
- Servicio de OCR en local con GPU de consumo: al ocupar 3,04 GB de pesos y mantener las activaciones en BF16, el checkpoint puede desplegarse en una estación de trabajo con una única GPU moderna, sin depender de APIs externas.
- Despliegue en borde sobre hardware ARM64: el autor publica imágenes de contenedor fijadas para AMD64 y ARM64 y verificó el mismo peso, configuración y página en Thor con `--memory-fraction 0.035`, lo que apunta a escenarios de OCR en dispositivo.
- Integración en pipelines de vLLM existentes: el paquete usa la interfaz compressed-tensors NVFP4A16 y la librería declarada es vllm, de modo que encaja en infraestructuras que ya sirven modelos con vLLM 0.25.1 y CUDA 13.0.
- Comparación de precisión en investigación de cuantización: los 511 tensores BF16 protegidos y la paridad de bytes verificada entre el codificador numpy y el CUDA permiten usar este checkpoint como referencia de una ruta RTN W4A16 frente a la ruta calibrada W4A4.
- Pruebas de regresión de runtime: el repositorio incluye `development_runtime_smoke.json` con digests de checkpoint, imagen y petición, útil como caso de verificación reproducible en CI sobre GPU.

Advertencia: todos estos casos son hipótesis de uso derivadas del pipeline declarado y de la única prueba de humo documentada. El autor indica explícitamente que una página pequeña no establece calidad OCR general ni marcado de maquetación correcto, y que los documentos reales y la concurrencia requieren validación independiente y dimensionado de memoria propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara de forma explícita que esta preview de desarrollo no añade ninguna afirmación de calidad, exactitud MTP, velocidad o certificación, y que las pruebas realizadas son una única página generada.

La única evidencia de ejecución publicada es cualitativa:

| GPU | Carga y generación NVFP4 | Líneas esperadas de la página |
|---|---|---|
| GeForce RTX 5090 | Correcto | Presentes |
| Thor | Correcto | Presentes |

El control con el checkpoint original en BF16 sobre RTX 5090 también reconoció las tres líneas. El autor advierte además que las advertencias de modo *eager*, JIT en la primera petición y caché de autotune ausente corresponden a la configuración de prueba y pueden afectar a la latencia, y que no constituyen evidencia de velocidad.

## Requisitos de hardware

- Peso del checkpoint: 3.037.542.952 bytes (unos 3,04 GB / 2,83 GiB). A partir de esa cifra, la VRAM necesaria para pesos ronda los 3 GB, a los que hay que sumar activaciones BF16, memoria de contexto y overhead del runtime. El autor no publica cifras de VRAM.
- GPU verificadas por el autor: GeForce RTX 5090 y Thor, ambas con carga y generación correctas usando vLLM 0.25.1, PyTorch 2.11.0+cu130 y CUDA 13.0.
- GPU de consumo: con 3,04 GB de pesos, el checkpoint es candidato a caber en GPU de consumo modernas, pero no hay confirmación publicada más allá de la RTX 5090.
- Configuración de memoria en la prueba: `--memory-fraction 0.30` en RTX 5090 y `--memory-fraction 0.035` en la receta probada para Thor.
- Ruta de ejecución: kernels `MarlinNvFp4LinearKernel` y `MARLIN` para MoE. En Thor, el autor advierte que esta ruta Marlin usa compresión FP4 solo en pesos en lugar de computación FP4 nativa, por lo que el rendimiento en cargas intensivas de cómputo no está cualificado.
- Opciones de despliegue: vLLM (librería declarada, con interfaz compressed-tensors NVFP4A16), con imágenes de contenedor AMD64 y ARM64 fijadas y publicadas en `development_runtime_smoke.json`. No se documentan otros motores (llama.cpp, Ollama, TGI) para este paquete.
- Latencia y throughput: no disponibles. La primera petición activa compilación JIT y no hay caché de autotune en la configuración de prueba, factores que el autor señala como potencialmente penalizadores de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A16 (este) | 3.389.119.360 totales; 2.602.844.160 en NVFP4 | NVFP4 W4A16, activaciones BF16 | no disponible | apache-2.0 | HuggingFace, preview de desarrollo |
| deepseek-ai/DeepSeek-OCR-2 (base) | 3.389.119.360 (BF16) | BF16 sin cuantizar | no disponible | apache-2.0 | HuggingFace, revisión aaa02f3811945a91062062994c5c4a3f4c0af2b0 |
| AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A4 (sucesor) | no disponible | NVFP4 W4A4, calibrado, con kernels CUTLASS lineal nativo y MoE cuantizado nativo | no disponible | apache-2.0 (inferido del origen) | HuggingFace |

Frente al checkpoint base, esta conversión reduce el payload de pesos de BF16 a 3,04 GB, a costa de introducir cuantización en atención, MLP y expertos. Frente al sucesor W4A4, el propio autor recomienda este último cuando se necesita computación FP4 nativa verificada; el W4A16 aquí descrito ejecuta Marlin con compresión FP4 solo en pesos. No se dispone de datos de rendimiento comparado entre las tres variantes.

## Limitaciones y advertencias

- Es una *development preview*. El autor declara que no se añade ninguna garantía de calidad, exactitud MTP, velocidad ni certificación, y que la evidencia histórica queda ligada a su revisión original.
- La validación funcional se reduce a una única página generada con tres líneas reconocidas. No hay evidencia de precisión OCR general ni de marcado de maquetación correcto.
- Los documentos reales y la concurrencia requieren validación independiente y dimensionado de memoria propio.
- En Thor, la ruta Marlin usa compresión FP4 solo en pesos en lugar de computación FP4 nativa y el rendimiento en cargas intensivas de cómputo no está cualificado.
- El modo *eager*, la compilación JIT en la primera petición y la ausencia de caché de autotune pueden afectar a la latencia, según el propio autor.
- El build original puede emitir advertencias por variables de entorno de imagen desconocidas (`VLLM_BUILD_COMMIT`, `VLLM_BUILD_PIPELINE`, `VLLM_BUILD_URL`, `VLLM_IMAGE_TAG`), que no son ajustes de inferencia.
- No hay información disponible sobre sesgos, idiomas soportados, longitud de contexto ni riesgo de alucinación medido.
- Licencia apache-2.0 heredada del modelo original, con `LICENSE.txt` sin modificar; la conversión no añade restricciones adicionales declaradas, pero conviene revisar la licencia del modelo base antes de uso comercial.
- El ejemplo de reproducer rechaza líneas repetidas no vacías, lo que implica que el autor ya observó ese modo de fallo en generación.
- El modelo no está dentro del alcance de exportación MLX/oMLX/MTPLX, según la auditoría de runtime incluida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A16
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Sucesor W4A4 recomendado por el autor: https://huggingface.co/AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A4
- Artefactos citados en el repositorio: `runtime_audit.json`, `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`, `provenance.json`, `development_runtime_smoke.json`, `SHA256SUMS.txt`, `examples/ocr_smoke.py`, `examples/ocr-smoke-page.png`, `LICENSE.txt`
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
