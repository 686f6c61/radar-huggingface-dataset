# DikovAlexandr/ActivationSteeringRepair

## Resumen

Activation Steering Repair es un repositorio de investigación que publica los pesos de un denoising autoencoder (DAE) gaussiano seleccionado para reparar activaciones del residual stream de los modelos Qwen3-0.6B y Qwen3-1.7B. No es un modelo de lenguaje independiente, sino un componente auxiliar para experimentos de interpretabilidad, concretamente para la técnica de activation steering. El autor es DikovAlexandr y el trabajo se acompaña de un informe en formato IEEE y código reproducible en GitHub.

El problema que aborda es el deterioro de la fluidez y la coherencia del texto cuando se inyectan vectores de steering en el residual stream. El DAE se entrena para eliminar el ruido gaussiano isotrópico de las activaciones del bloque 13, de modo que pueda corregir las distorsiones inducidas por el steering. La selección del checkpoint se realiza únicamente por el error cuadrático medio (MSE) de reconstrucción sobre activaciones limpias, con una restricción de MSE identidad.

La relevancia actual reside en que la técnica de activation steering es un área activa de investigación en interpretabilidad y alineación, y este trabajo aporta un resultado negativo controlado: la reparación ortogonal (ODR) no mejora el equilibrio entre steering y fluidez evaluado por jueces LLM. Por tanto, estos pesos son artefactos de investigación, no una solución de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoising autoencoder (DAE) con bottleneck lineal, aplicado a activaciones del bloque 13 del transformer |
| Parametros totales | 1,051,136 (Qwen3-0.6B) y 4,199,424 (Qwen3-1.7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no procesa texto directamente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta multiples idiomas, pero el DAE no genera texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (denoiser.safetensors) |

## Arquitectura y entrenamiento

El DAE es un autoencoder de denoising que opera sobre vectores de activación del residual stream del transformer Qwen3. Concretamente, se entrena en la salida del bloque 13, con un tamaño de entrada de 1024 (para Qwen3-0.6B) y 2048 (para Qwen3-1.7B), y un cuello de botella de 512 y 1024 respectivamente. El entrenamiento usa activaciones limpias de WikiText-2 y las corrompe con desplazamiento gaussiano isotrópico, cuya fuerza se controla mediante el parámetro `rho = ||noise|| / ||clean activation||`. El objetivo es reconstruir la activación limpia minimizando el MSE en un split de validación, sujeto a una restricción de MSE identidad para evitar que el modelo simplemente copie la entrada. El checkpoint seleccionado es el que mejor reconstruye en el split reservado.

No se utilizan vectores de persona, etiquetas de rasgos, prompts de extracción ni generaciones finales de evaluación durante el entrenamiento. El método de reparación denominado ODR (orthogonal denoising repair) elimina del vector de corrección del DAE la componente paralela al vector de steering. El código completo de hooks y reparación está disponible en el repositorio GitHub vinculado.

## Capacidades

- Reparación de activaciones del residual stream de Qwen3-0.6B y Qwen3-1.7B.
- Corrección de ruido gaussiano isotrópico en activaciones del bloque 13.
- Integración con técnicas de activation steering para restaurar activaciones steered.
- No es un modelo generativo: no produce texto, no tiene tool calling, ni capacidades de razonamiento, visión o audio.
- No soporta agentes ni multi-step reasoning.
- Su único uso es como componente de investigación en pipelines de interpretación.

## Casos de uso

- Investigacion de interpretabilidad: el DAE permite aislar la componente de ruido introducida por un vector de steering y estudiar su efecto en la activación original, facilitando análisis de la geometría del residual stream.
- Evaluacion de metodos de reparacion: se puede comparar el efecto de aplicar ODR frente a la simple adición de activaciones para medir el trade-off entre fidelidad del steering y fluidez del texto generado.
- Desarrollo de tecnicas de alineacion: en experimentos controlados sobre como afectan los vectores de steering a la calidad del output, este modelo sirve como referencia de un resultado negativo riguroso.
- Pruebas de robustez de modelos: permite inyectar ruido controlado en capas intermedias para estudiar la sensibilidad del modelo a perturbaciones de activación.
- Benchmark de metodos de denoising: sirve como baseline para otros DAEs o técnicas de reparación de activaciones en modelos de la familia Qwen3.
- Reproducibilidad de experimentos: al publicar pesos, configuracion y checksums, facilita la replicación exacta de los experimentos del informe IEEE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El modelo se evalúa únicamente por la métrica de reconstrucción MSE sobre activaciones limpias de WikiText-2, pero los valores numéricos no se incluyen en la model card. El estudio reporta que la reparación ODR preserva la coordenada de steering hasta precisión numérica, pero no mejora el trade-off steering-fluidez evaluado por jueces LLM (GPT-5.6 Sol y Claude Opus 4.8) sobre la adición de activación cruda.

## Requisitos de hardware

- El modelo es muy pequeño: 1.05 M de parámetros para la versión 0.6B y 4.2 M para la 1.7B.
- VRAM estimada: inferior a 100 MB para cada checkpoint (los pesos en safetensors ocupan menos de 20 MB).
- GPU recomendadas: cualquier GPU moderna, incluyendo consumer como RTX 3060 o incluso CPU para inferencia puntual.
- No requiere hardware especializado; se puede ejecutar en cualquier entorno con PyTorch.
- Opciones de despliegue: se carga con la implementación del repositorio GitHub (`load_denoiser_checkpoint`), no requiere vLLM, llama.cpp ni Ollama.
- Latencia: del orden de microsegundos por llamada, negligible en comparación con la inferencia del modelo base.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables de reparación de activaciones con la misma arquitectura y propósito. La técnica de activation steering se suele aplicar directamente sin un componente de denoising, y no hay alternativas públicas equivalentes en el momento de la consulta.

## Limitaciones y advertencias

- Resultado negativo controlado: la reparación ODR no mejora el trade-off steering-fluidez sobre la adición de activación cruda, por lo que no debe usarse como solución general.
- Alcance limitado: solo se probaron dos tamaños de una familia (Qwen3), una capa (bloque 13) y cuatro rasgos de personalidad.
- Evaluación con jueces LLM: los resultados se basan en evaluaciones ciegas de GPT-5.6 Sol y Claude Opus 4.8, no en preferencias humanas.
- Riesgo de mal uso: al ser un artefacto de investigación, su aplicación fuera de un contexto experimental puede inducir a error.
- Sin garantías de calidad: los pesos no se han validado para casos de uso productivos.
- Licencia Apache-2.0 permite uso comercial, pero no se recomienda sin una evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DikovAlexandr/ActivationSteeringRepair
- Codigo y materiales de reproduccion: https://github.com/DikovAlexandr/ActivationSteeringRepair
- Informe IEEE: https://github.com/DikovAlexandr/ActivationSteeringRepair/blob/main/paper/report.pdf
- Articulo relacionado sobre steering awareness: https://arxiv.org/html/2511.21399v2
- Blog sobre activation steering: https://huggingface.co/blog/royswastik/activation-steering
