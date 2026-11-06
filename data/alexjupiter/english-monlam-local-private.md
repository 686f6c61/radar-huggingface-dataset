# AlexJupiter/english-monlam-local-private

## Resumen

`english-monlam-local-private` es un paquete experimental de pesos cifrados publicado por AlexJupiter para el runtime de inferencia privada New Tibet. No es un checkpoint de Transformers ni una API alojada: es un paquete de ejecución CKKS (Cheon-Kim-Kim-Song), un esquema de cifrado totalmente homomórfico (FHE) que permite computar sobre datos cifrados. El modelo se deriva del modelo base Monlam Melong (una variante de Gemma 2 en cuantización q4) fusionado con un adaptador LoRA en inglés, y se distribuye con los pesos proyectados a representación FHE.

La propuesta es relevante porque invierte el modelo de confianza habitual en inferencia en la nube: el cliente conserva la clave secreta, la atención, la caché KV y las operaciones no lineales, mientras que el host comunitario solo recibe ciphertexts y claves de evaluación públicas. Esto permite delegar cómputo sin exponer datos de usuario al proveedor de infraestructura. El autor reporta un paso completo de modelo con caché en 47,27 segundos sobre un Mac con chip M3, frente a 134,47 segundos de una línea base FHE anterior, y una velocidad de unos 13 tokens por segundo en inglés nativo.

Se trata de un artefacto de investigación, no de un protocolo auditado frente a hosts maliciosos ni de una evaluación de calidad en contexto largo. El repositorio ocupa 54,2 GB y los datos del modelo en el host rondan los 50 GiB en disco, servidos mediante búferes de RAM acotados. La licencia es Gemma, con las restricciones de uso y redistribución que esta impone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 2 (base Monlam Melong), empaquetado en representación FHE CKKS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en q4; representación FHE con aritmética nativa uint32 en Metal, N=8192 y primos Q/P por debajo de 2^31 |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms, Prohibited Use Policy y Notice incluidos) |
| Formato de pesos | Coeficientes públicos en paquete de ejecución CKKS (no safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Gemma 2, en concreto la base Monlam Melong en cuantización q4 (revisión `663b1e876362d51324bbd4ac8e7c77fecf4f90f4`), fusionada con el adaptador LoRA en inglés `monlam-melong-mlx-english-adapter-preview` (revisión `b6bb4422ccf841e4a01a8d7cdb42fef325a02430`). La fusión se realiza antes de preparar los pesos de proyección FHE. Según la model card, la representación FHE es una conversión de formato, no un entrenamiento adicional: no hay datos nuevos de entrenamiento ni etapas de RLHF o DPO documentadas en la información disponible.

La innovación técnica principal es el esquema de ejecución homomórfica: el cliente mantiene la clave secreta, la atención, la caché KV y las operaciones no lineales, mientras que el host solo recibe ciphertexts y claves de evaluación públicas. La aritmética nativa uint32 sobre Metal emplea un grado de polinomio N=8192 y primos Q/P por debajo de 2^31. El paquete incluye únicamente coeficientes públicos; las claves secretas del runtime, las claves de evaluación, los datos de chat y los fixtures de benchmark quedan excluidos y verificados mediante un manifiesto con checksums.

## Capacidades

- Generación de texto en inglés sobre el modelo base Monlam Melong (Gemma 2), con la calidad heredada del checkpoint original y del adaptador LoRA en inglés.
- Inferencia privada mediante cifrado homomórfico CKKS: el host procesa ciphertexts sin acceso a los datos en claro.
- Ejecución local en Apple Silicon con aritmética Metal nativa (uint32), orientada a despliegues en hardware de escritorio.
- Streaming de pesos desde disco mediante búferes de RAM acotados, pensado para entornos con memoria limitada.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking específicas de este paquete.
- Capacidades multilingües limitadas al inglés según el campo `language: en` de la model card.

## Casos de uso

- Inferencia privada sobre documentos sensibles: el cliente cifra las entradas y el host solo ve ciphertexts, de modo que contratos, historiales clínicos o notas legales pueden procesarse en infraestructura de terceros sin exponer el contenido en claro.
- Despliegue en escritorio con Apple Silicon: el runtime está optimizado para Metal y aritmética uint32, lo que permite ejecutar el paquete en un Mac con chip M3 a unos 13 tokens por segundo en inglés nativo, según el autor.
- Investigación en criptografía aplicada: sirve como banco de pruebas reproducible para medir el coste de operaciones no lineales y de atención bajo FHE, con un paso completo de modelo cacheado en 47,27 segundos en M3.
- Evaluación de protocolos de confianza mínima: útil para estudiar qué garantías ofrece un host que solo recibe claves de evaluación públicas, aunque el propio autor advierte que no es un protocolo auditado frente a hosts maliciosos.
- Prototipos de asistentes de texto en inglés con requisitos de confidencialidad: el paquete puede integrarse en flujos donde el proveedor de cómputo no debe poder leer las consultas, siempre que se asuma el coste de latencia del esquema FHE.
- Reproducción de benchmarks FHE: el repositorio fuente de New Tibet incluye el informe de benchmark y las revisiones exactas, lo que facilita comparar esta línea base (47,27 s) con implementaciones anteriores (134,47 s).

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Paso completo de modelo con caché | 47,27 s | Mac con chip M3, paquete FHE actual |
| Paso completo de modelo con caché (línea base FHE anterior) | 134,47 s | Mac con chip M3, implementación previa |
| Velocidad en inglés nativo | ~13 tokens/s | Mac con chip M3 |
| Grado de polinomio FHE | N=8192 | Aritmética uint32 nativa en Metal |
| Primos Q/P | por debajo de 2^31 | Configuración CKKS del runtime |
| Huella en disco del modelo en host | ~50 GiB | Streaming mediante búferes de RAM acotados |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el modelo en host ocupa aproximadamente 50 GiB en disco y se sirve mediante streaming con búferes de RAM acotados; no se especifica el pico de RAM necesario.
- GPU recomendadas: el runtime documentado está orientado a Apple Silicon con Metal (medición sobre M3). No se documentan requisitos para A100, H100 ni RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, al menos en Apple Silicon de la gama M3 según la medición del autor; no hay datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: runtime propio New Tibet (repositorio `AlexJupiter/new-tibet-app-testnet`); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el paquete no es un checkpoint de Transformers.
- Latencia y throughput: 47,27 s por paso completo cacheado y ~13 tokens/s en inglés nativo sobre M3, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| english-monlam-local-private | no disponible | no disponible | FHE CKKS sobre Gemma 2 q4 + LoRA inglés | gemma | Hugging Face (pesos cifrados, runtime propio) |
| Monlam Melong preview (base) | no disponible | no disponible | Transformer Gemma 2 estándar | gemma | Hugging Face |
| monlam-melong-mlx-english-adapter-preview (adaptador) | no disponible | no disponible | Adaptador LoRA en inglés | no disponible | Hugging Face |
| LocaLLM | no disponible | no disponible | Inferencia local en navegador de escritorio | no disponible | locallm.net |

No se dispone de datos de benchmarks comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor califica el paquete como experimental y advierte de que no es un protocolo auditado frente a hosts maliciosos.
- No se ha realizado una evaluación de calidad en contexto largo; el rendimiento cualitativo del modelo fusionado no está documentado.
- La licencia Gemma impone restricciones de uso y redistribución: deben incluirse los Gemma Terms, la Prohibited Use Policy y el Notice, y transmitirse a los destinatarios.
- El paquete no relicencia los pesos upstream bajo la licencia del software del runtime FHE.
- El idioma soportado es únicamente inglés, lo que limita su uso en entornos multilingües.
- El coste computacional del esquema FHE es alto (47,27 s por paso completo en M3), lo que lo hace inadecuado para aplicaciones interactivas de baja latencia.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas para este paquete; se heredan los del modelo base Gemma 2 y del adaptador, sin datos disponibles en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la fecha de creación indicada (2026-11-06) debe tratarse con cautela.
- No hay soporte documentado para tool calling, agentes ni visión, por lo que no debe asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexJupiter/english-monlam-local-private
- Modelo base Monlam Melong: https://huggingface.co/TenzinGayche/Monlam_Melong_preview
- Adaptador LoRA en inglés: https://huggingface.co/AlexJupiter/monlam-melong-mlx-english-adapter-preview
- Repositorio del runtime New Tibet: https://github.com/AlexJupiter/new-tibet-app-testnet
- LocaLLM (referencia de inferencia local privada): https://locallm.net/
- Guía de modelos locales en Medium (referencia): https://medium.com/@AlinaroseWrites/stop-paying-for-cloud-ai-how-to-run-powerful-models-locally-and-privately-in-2026-8b71ff2bacbd
