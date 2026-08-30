# Prannesshkva/Phantom-SSM-130M

## Resumen

PHANTOM-SSM es un modelo de lenguaje basado en state space models (SSM) desarrollado por Prannessh KVA, presentado como una alternativa a los SSM selectivos clásicos como Mamba-1 o S4. Su principal innovación consiste en sustituir la evolución temporal disipativa (con autovalores de parte real negativa) por una recurrencia unitaria generada mediante una transformada de Cayley sobre un generador hamiltoniano antisimétrico, lo que garantiza la conservación exacta de la norma del estado oculto a lo largo de secuencias extremadamente largas. El modelo declara soportar contextos de más de un millón de tokens reales sin padding, algo que los SSM convencionales no logran por su decaimiento exponencial.

Con 129,1 millones de parámetros, PHANTOM-SSM se posiciona como un modelo compacto orientado a tareas de generación de texto con requisitos de memoria reducidos. Incorpora además un sistema de caché de prefijos basado en radix (paquete `phantom-cache`) que acelera el tiempo hasta el primer token (TTFT) en conversaciones multi-turno, y una cuantización dinámica INT8 de los estados que reduce el consumo de VRAM en un 75%. El modelo está disponible en Hugging Face con pesos en formato safetensors y requiere `trust_remote_code=True` para su carga.

Aunque los benchmarks publicados son proporcionados por el propio autor y no han sido verificados de forma independiente, los resultados indican una retención perfecta de información en pruebas tipo needle-in-a-haystack a 50.000 tokens y un consumo de VRAM de solo 7,86 GB al procesar un millón de tokens en una GPU Tesla P100 de 16 GB. El modelo se distribuye bajo licencia BSL 1.1 (mencionada en la insignia de la model card), lo que podría implicar restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (SSM) con recurrencia unitaria cuántica (Cayley transform) |
| Parametros totales | 129.135.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.000.000+ tokens (declarado, sin padding) |
| Tipos de cuantizacion | INT8 dinámica para estados (RMSE = 0.01056), FP32 para pesos |
| Idiomas soportados | Inglés (en) |
| Licencia | other (BSL 1.1 según insignia de la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PHANTOM-SSM se basa en una arquitectura de espacio de estados recurrente donde la evolución temporal se parametriza mediante un generador hamiltoniano sesgado-antisimétrico (skew-symmetric) que se mapea a una matriz unitaria a través de la transformada de Cayley. Esto garantiza que todos los autovalores tengan módulo exactamente 1 (|λ| = 1.0), eliminando el decaimiento exponencial típico de los SSM selectivos que imponen estabilidad de Hurwitz (Re(λ) < 0). El estado oculto se modela como una matriz de densidad continua (outer-product), lo que permite una recuperación asociativa exacta (100% de similitud coseno en pruebas de needle retrieval).

El entrenamiento se realizó sobre un corpus literario de 4.461.576 caracteres (1.360.960 tokens BPE) según los benchmarks publicados, aunque no se especifica la composición exacta del dataset ni el número de epochs. Tampoco se detalla si se emplearon técnicas de alineación como RLHF o DPO. El modelo incorpora dos innovaciones adicionales: un caché de prefijos radix (implementado en el paquete `phantom-cache`) que reutiliza estados previos para acelerar el TTFT, y una cuantización INT8 dinámica de los estados que comprime la memoria en un factor de 4 con una degradación mínima (RMSE = 0.01056). La generación autoregresiva mantiene complejidad O(1) en tiempo constante por token.

## Capacidades

- Generación de texto autoregresiva con contexto largo (hasta 1M+ tokens declarados).
- Recuperación asociativa de información a larga distancia: similitud coseno de 1.0 en needle-in-a-haystack a token 50.000.
- Caché de prefijos radix para reanudación instantánea de prompts (0 ms de TTFT en hits de caché, 5.1x más rápido que prefill completo).
- Cuantización dinámica INT8 de estados con reconstrucción casi perfecta (RMSE 0.01).
- Generación con muestreo (temperature, do_sample) y decodificación estándar.
- Soporte de tool calling: no declarado explícitamente, aunque el código de ejemplo solo muestra generación básica.
- Capacidades multilingües: solo inglés declarado.
- No hay evidencia de soporte para visión, audio o modo pensamiento.

## Casos de uso

- Procesamiento de documentos largos: el modelo puede ingerir libros completos o expedientes de miles de páginas gracias a su contexto de 1M+ tokens, permitiendo resúmenes o extracción de información sin truncamiento. Su baja VRAM (7,86 GB a 1M tokens) lo hace viable en GPUs de gama media.
- Chatbots de atención al cliente con historial extenso: la caché de prefijos radix permite retomar conversaciones multi-turno sin reprocesar el prompt completo, reduciendo la latencia percibida y el coste computacional.
- Análisis de código fuente en repositorios grandes: con contexto suficiente para abarcar múltiples archivos, puede realizar razonamiento sobre dependencias entre módulos o generar documentación de proyectos extensos.
- Sistemas de recuperación aumentada (RAG) con memorias de largo plazo: la conservación de norma y la recuperación asociativa exacta permiten indexar y consultar estados latentes de secuencias muy largas, útil para agentes con memoria persistente.
- Generación de texto creativo de largo formato: novelas, guiones o narrativa interactiva donde se requiere mantener coherencia argumental a lo largo de decenas de miles de tokens.
- Inferencia en entornos con recursos limitados: al caber en una GPU de 16 GB incluso con 1M tokens, es adecuado para despliegues edge o en infraestructura modesta sin necesidad de clústeres.

## Benchmarks y rendimiento

Los siguientes datos provienen exclusivamente de la model card del autor, ejecutados en una NVIDIA Tesla P100-PCIE-16GB (CUDA 12.1, PyTorch 2.3.1) sobre texto natural real sin padding (1.360.960 tokens BPE de un corpus literario). No se han verificado de forma independiente.

| Benchmark | Classical SSM Baseline | PHANTOM-SSM | Ventaja medida |
|---|---|---|---|
| Prefix TTFT (389 tokens) | 2.888,0 ms (prefill completo) | 568,0 ms (radix hit) | 5,1x más rápido |
| VRAM de estado por sesión | 18,0 MB (FP32) | 4,5 MB (INT8) | 75% de ahorro |
| RMSE de reconstrucción INT8 | N/A | 0,01056 | Degradación despreciable |
| Norma tras 1.000.000 tokens | 61,86 (decaimiento) | 230,27 (conservada) | Unitary ‖U‖₂ = 1.000 |
| Needle retrieval (token 50k) | Pérdida severa (<20%) | Similitud coseno = 1,00000 | 100% de recall exacto |
| VRAM pico a 1M tokens | >250 GB (OOM en transformer) | 7,86 GB | Ejecutable en GPU de 16 GB |

En cuanto a velocidad de ingesta, el modelo procesa 3.671,9 tokens/segundo en la P100 (frente a 6.781,7 tokens/segundo del SSM clásico, que sufre disipación). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 7,86 GB pico para procesar 1M tokens con cuantización INT8 de estados (según benchmarks del autor). Para contextos más cortos, el consumo será proporcionalmente menor.
- GPU recomendada: el modelo fue validado en una Tesla P100-PCIE-16GB (Pascal, 16 GB). Es compatible con cualquier GPU con al menos 8 GB de VRAM para contextos moderados.
- Cabe en GPUs de consumo: sí, tarjetas como RTX 3060 (12 GB) o RTX 4060 (8 GB) podrían ejecutarlo para contextos de hasta 1M tokens, aunque con menor throughput.
- Opciones de despliegue: se integra con Hugging Face Transformers mediante `trust_remote_code=True`. El paquete `phantom-cache` (PyPI) proporciona la caché radix. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 568 ms de TTFT con caché radix para un prompt de 389 tokens (frente a 2.888 ms sin caché). Throughput de ingesta de 3.671,9 tokens/segundo en P100.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (SSM de ~130M) en la información proporcionada. La model card menciona una "Classical SSM Baseline" sin especificar el modelo concreto (podría ser Mamba-1 o S4). A modo de referencia cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PHANTOM-SSM-130M | 129M | 1M+ (declarado) | BSL 1.1 | Hugging Face (custom code) |
| Mamba-1 (130M) | ~130M | 32K (típico) | Apache 2.0 | Hugging Face |
| S4 (125M) | ~125M | 2K-16K | Apache 2.0 | GitHub |

Las diferencias clave son la conservación de norma (unitaria) y el caché radix, que no están presentes en los SSM clásicos. Sin embargo, no hay benchmarks estándar que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Los benchmarks publicados son del propio autor y no han sido auditados de forma independiente; deben tomarse con cautela.
- El modelo es muy pequeño (130M parámetros), por lo que su capacidad de razonamiento complejo, matemáticas o generación de código será limitada en comparación con modelos grandes.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La licencia BSL 1.1 (indicada como "other") puede restringir el uso comercial en producción; es necesario revisar los términos exactos antes de desplegarlo.
- Requiere `trust_remote_code=True` en Hugging Face, lo que implica ejecutar código arbitrario del autor; riesgo de seguridad si el repositorio se ve comprometido.
- No se especifica el proceso de entrenamiento (datos, número de tokens, alineación), lo que dificulta evaluar sesgos o calidad.
- La caché radix y la cuantización INT8 dependen del paquete `phantom-cache` (v0.1.0), que es una dependencia externa no estándar y podría tener problemas de mantenimiento.
- No hay evidencia de soporte para tool calling, agentes o razonamiento multi-paso; el modelo parece orientado a generación de texto continua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prannesshkva/Phantom-SSM-130M
- Perfil del autor en Hugging Face: https://huggingface.co/Prannesshkva/datasets
- Repositorios de GitHub del autor: https://github.com/Prannessh2006?tab=repositories
- Paquete PyPI `phantom-cache`: https://pypi.org/project/phantom-cache/ (mencionado en la model card)
- Otro modelo del autor (Ael-504M): https://huggingface.co/Prannesshkva/Ael-504M
