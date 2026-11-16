# addiesam/Qwen3.8-27B-DFlash2_qvb8_2e-3_fp16

## Resumen

Qwen3.8-27B-DFlash2_qvb8_2e-3_fp16 es un paquete de pesos cuantizados publicado por el investigador independiente addiesam (Dr. Addie Sam) a partir del modelo borrador (draft model) de decodificación especulativa incoai/Qwen3.8-27B-DFlash2, que a su vez es el draft de Qwen3.8-27B. No es un modelo autónomo: es un borrador que propone tokens que el modelo objetivo verifica, de modo que acelera la generación sin alterar la distribución de salida del modelo grande.

La innovación central no es la arquitectura, sino el método de compresión: QVB8, un esquema de cuantización con cota certificada en norma L-infinito (L∞). Para cada peso restaurado, el error absoluto frente al valor bf16 original es inferior a tau = 0,002, y el error máximo real medido por tensor (0,001998) se registra en el `manifest.json`. Frente a la cuantización tradicional, que se evalúa por medias (perplejidad, benchmarks), este enfoque controla el peor caso, lo que reduce la probabilidad de fallos puntuales como palabras erróneas o caracteres de otro idioma intercalados.

El paquete ocupa 2,1 GB en disco, comprende 49 tensores comprimidos con una media de 8,89 bits por peso y está certificado para restauración en fp16. Requiere obligatoriamente el motor de inferencia QVB8 (v1.2.0 o posterior), que descomprime los pesos dentro de sus propios kernels CUDA; no es cargable en `transformers` ni en otros motores convencionales. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo borrador de decodificacion especulativa DFlash2 para Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 267.520 (segun safetensors); el nombre comercial indica 27B, dato no verificable en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con cota L∞, tau = 0,002; 49 tensores comprimidos, media de 8,89 bits por peso; restauracion certificada en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors empaquetados en formato QVB8 (requiere el motor QVB8; no cargable en `transformers`) |

## Arquitectura y entrenamiento

El modelo base es un borrador de decodificación especulativa (DFlash2) diseñado para emparejarse con Qwen3.8-27B: propone varios tokens por paso (DRAFT_K=7 en la configuración recomendada) y el modelo objetivo los verifica en paralelo, aceptando el prefijo correcto. Este paquete no entrena nada nuevo; es una recompresión del borrador original en bf16.

La compresión QVB8 asigna un ancho de bits por fila a cada matriz de pesos y verifica el resultado tras el empaquetado, tensor por tensor. El proceso no utiliza datos de calibración: depende únicamente de los pesos, lo que lo hace reproducible e independiente del corpus. Para cada tensor se registra el error máximo entre el valor restaurado y el bf16 original en `manifest.json` (`max_err`), y ningún tensor supera tau. El compromiso es explícito: un tau menor implica mayor fidelidad y mayor tamaño; un tau mayor, menor tamaño y mayor perplejidad. El propio autor advierte que la cota cubre solo los pesos almacenados y no garantiza que las respuestas sean idénticas a las del original, ya que el orden de operaciones en coma flotante y el tamaño de lote introducen diferencias.

## Capacidades

- Generación de tokens especulativa: propone secuencias candidatas que el modelo objetivo Qwen3.8-27B valida, acelerando la decodificación.
- Aceleración de inferencia sin cambio de distribución: al ser un borrador verificado, la salida final es la del modelo objetivo.
- Compatibilidad con el motor QVB8: descompresión en GPU dentro de kernels CUDA propios.
- Restauración certificada en fp16 con cota de error verificable por tensor.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento por sí mismo: esas capacidades residen en el modelo objetivo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de Qwen3.8-27B con latencia reducida: se empareja este borrador con el pack objetivo (`Qwen3.8-27B_qvb8_1e-3_fp16`, 21,6 GB) y se arranca con `DRAFT_K=7`; la verificación especulativa reduce el número de pasos de decodificación efectivos.
- Servicio de chat en hardware ajustado: el borrador ocupa solo 2,1 GB, de modo que el grueso del presupuesto de VRAM queda para el modelo objetivo y la caché KV.
- Investigación sobre cuantización con garantías: sirve como caso de estudio reproducible de compresión L∞ con error máximo auditables en `manifest.json`, útil para comparar frente a esquemas evaluados solo por perplejidad.
- Validación de pipelines de decodificación especulativa: permite medir la tasa de aceptación de tokens con distintos valores de DRAFT_K y distintos taus (2e-3 en qvb8, 5e-3 en qvb8r).
- Evaluación de robustez ante errores puntuales: al controlar el peor caso por peso, es adecuado para estudiar fallos tipo token aislado erróneo en lugar de degradación media.
- Entornos con requisitos de licencia permisiva: Apache-2.0 permite uso comercial e integración en productos derivados, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de compresión: tau = 0,002, error máximo observado de 0,001998, 49 tensores comprimidos, media de 8,89 bits por peso y 2,1 GB en disco. No hay datos de tasa de aceptación de tokens, latencia ni throughput.

## Requisitos de hardware

- VRAM para el borrador: 2,1 GB en disco; el motor QVB8 descomprime en GPU, por lo que se necesita VRAM adicional para los pesos restaurados en fp16 y para los buffers del motor. Cifra exacta no disponible.
- VRAM total del sistema: debe sumarse el pack objetivo (21,6 GB en qvb8 tau 1e-3, o 13,6 GB en qvb8r tau 2e-3) más la caché KV del contexto.
- GPU recomendadas: no disponibles en la información proporcionada; el motor requiere CUDA y el autor menciona que necesita máquinas de otras generaciones de GPU para probar, lo que sugiere compatibilidad aún no validada de forma amplia.
- GPU de consumo: no confirmado; la viabilidad depende del pack objetivo, no del borrador.
- Despliegue: exclusivamente mediante el motor QVB8 v1.2.0 o posterior (`scripts/qwen_server.sh start` con `MODEL`, `DRAFT` y `DRAFT_K`); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2_qvb8_2e-3_fp16 (este) | 267.520 (segun safetensors) | no disponible | QVB8 | 2,1 GB | Apache-2.0 | Borrador con cota L∞ tau 2e-3; motor QVB8 |
| Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16 | no disponible | no disponible | QVB8R | 1,5 GB | Apache-2.0 | Misma familia, cota mas laxa (5e-3), menor tamano |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | bf16 | no disponible | Apache-2.0 | Modelo original sin comprimir |
| Qwen3.5-9B-DFlash_qvb8_1e-3 | no disponible | no disponible | QVB8 | 1,4 GB | Apache-2.0 | Borrador para un objetivo menor (9B) |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de otras familias.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el pack objetivo correspondiente y el motor QVB8 no produce respuestas útiles.
- Dependencia de un motor propietario de facto: el formato QVB8 solo se carga en el motor del mismo autor, lo que limita la portabilidad y crea riesgo de mantenimiento.
- La cota L∞ cubre únicamente los pesos almacenados; no garantiza respuestas idénticas ni correctas respecto al original.
- Diferencias inevitables por aritmética no asociativa en GPU, tamaño de lote y orden de operaciones en coma flotante.
- Sin datos publicados de benchmarks, tasa de aceptación especulativa ni latencia: difícil justificar su elección frente a alternativas estándar.
- Sin información sobre idiomas soportados ni sesgos conocidos del modelo base.
- El recuento de parámetros de safetensors (267.520) no concuerda con la denominación 27B; conviene verificar antes de dimensionar hardware.
- Uso comercial permitido por Apache-2.0, pero sujeto a la licencia y condiciones del modelo base incoai/Qwen3.8-27B-DFlash2.
- El autor no ofrece garantía alguna; el proyecto es de un investigador independiente y busca patrocinio para ampliar pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/addiesam/Qwen3.8-27B-DFlash2_qvb8_2e-3_fp16
- Modelo base: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Motor de inferencia QVB8: https://github.com/addiesam/qvb8
- Pack objetivo qvb8 tau 1e-3: https://huggingface.co/addiesam/Qwen3.8-27B_qvb8_1e-3_fp16
- Pack objetivo qvb8r tau 2e-3: https://huggingface.co/addiesam/Qwen3.8-27B_qvb8r_2e-3_fp16
- Borrador alternativo qvb8r tau 5e-3: https://huggingface.co/addiesam/Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16
- Pack Qwen3.5-9B qvb8 tau 1e-3: https://huggingface.co/addiesam/Qwen3.5-9B_qvb8_1e-3_fp16
- Borrador Qwen3.5-9B DFlash: https://huggingface.co/addiesam/Qwen3.5-9B-DFlash_qvb8_1e-3
- Patrocinio del autor: https://github.com/sponsors/addiesam
- Paper I (DOI): https://doi.org/10.5281/zenodo.23815007
- Paper II (DOI): https://doi.org/10.5281/zenodo.23816044
