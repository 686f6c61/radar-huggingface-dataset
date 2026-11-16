# addiesam/Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16

## Resumen

Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16 es un paquete de pesos cuantizados publicado por el investigador independiente addiesam (Dr. Addie Sam) a partir del modelo borrador (draft) incoai/Qwen3.8-27B-DFlash2, que a su vez es el modelo de decodificacion especulativa asociado a Qwen3.8-27B. No es un modelo generativo autonomo: es un modelo borrador que propone varios tokens por paso para que el modelo objetivo los verifique, acelerando la inferencia mediante decodificacion especulativa. El paquete contiene 49 tensores comprimidos con el formato propietario QVB8R y ocupa 1,5 GB en disco.

La innovacion central es la compresion con cota L-infinito certificada: para cada peso restaurado, el error absoluto maximo frente al valor original en bf16 queda acotado por tau = 0.005, y el error maximo observado (0.004997) se registra por tensor en manifest.json. El autor sostiene que este enfoque controla el peor caso, no solo la media, lo que evita fallos puntuales que una metrica agregada de perplejidad podria ocultar.

Es relevante ahora porque permite ejecutar un modelo borrador de 27B en hardware modesto dentro del motor QVB8, que decodifica los pesos comprimidos en kernels CUDA propios. La contrapartida es la dependencia total del motor: el paquete no carga en transformers ni en otras librerias, y requiere QVB8 Inference Engine v1.2.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador de decodificacion especulativa; el modelo base es Qwen3.8-27B-DFlash2) |
| Parametros totales | 267.520 (segun safetensors; el nombre del modelo sugiere ~27B, dato no confirmado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8R con cota L-infinito, tau = 0.005; 49 tensores comprimidos, media de 6,12 bits por peso; certificado para fp16 (`restore: fp16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QVB8R (safetensors en el repo; solo cargable por el motor QVB8, no por transformers) |

## Arquitectura y entrenamiento

El paquete no incluye informacion sobre la arquitectura del modelo base incoai/Qwen3.8-27B-DFlash2: la model card solo indica que se trata de un modelo borrador (draft) para decodificacion especulativa de Qwen3.8-27B. No se detallan capas, tipo de atencion, numero de cabezas ni composicion del dataset de entrenamiento. El modelo base se distribuye en bf16 y este paquete lo comprime.

El proceso de compresion es el unico paso documentado: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado, registrando el error maximo entre el valor restaurado y el peso original bf16 en manifest.json (`max_err`), sin que ningun tensor supere tau = 0.005. El empaquetado no usa datos de calibracion: depende unicamente de los pesos. No se menciona RLHF, DPO ni datos de entrenamiento adicionales.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: propone varios tokens por paso que el modelo objetivo Qwen3.8-27B verifica.
- Aceleracion de inferencia del modelo objetivo mediante el motor QVB8, con `DRAFT_K=7` como configuracion de referencia.
- Decodificacion de pesos comprimidos en GPU dentro de kernels CUDA del motor QVB8.
- No es un modelo de uso directo: no realiza generacion de texto, razonamiento, codigo ni matematicas por si mismo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Aceleracion de servidores de inferencia con Qwen3.8-27B: el paquete se despliega junto al paquete objetivo (`Qwen3.8-27B_qvb8r_2e-3_fp16` o `Qwen3.8-27B_qvb8_1e-3_fp16`) y actua como borrador con `DRAFT_K=7`, reduciendo el coste por token generado al verificar el modelo grande varios tokens a la vez.
- Despliegue en hardware con VRAM limitada: al ocupar solo 1,5 GB, el borrador cabe en GPUs consumer mientras el modelo objetivo se ejecuta en el mismo equipo o en otro nodo, segun la topologia que permita el motor QVB8.
- Evaluacion de compresion con cota L-infinito: util para investigadores que quieran reproducir el analisis de error maximo por tensor leyendo `max_err` en manifest.json y compararlo con el modelo original en bf16.
- Servicio de chat de baja latencia: combinado con el paquete objetivo, permite servir Qwen3.8-27B en produccion con menor latencia por token que la decodificacion autoregresiva estandar, siempre que el motor QVB8 este desplegado.
- Pruebas de integracion del motor QVB8: el paquete sirve como caso de prueba del comando `./qvb8 get qwen-27b`, que descarga objetivo y borrador juntos.
- Investigacion sobre decodificacion especulativa: permite medir la tasa de aceptacion de tokens del borrador frente al objetivo en distintos dominios sin necesidad de reentrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, tasa de aceptacion de tokens ni comparativas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: 1,5 GB para el borrador en formato QVB8R (tamano en disco del repo); la VRAM real depende de los buffers del motor QVB8 y del modelo objetivo, no disponibles.
- GPU recomendadas: no disponibles en la informacion proporcionada; el motor QVB8 usa kernels CUDA y el autor menciona que necesita probar "otras generaciones de GPU", sin listar modelos concretos.
- Cabe en GPU consumer: si, por tamano (1,5 GB), aunque el requisito real lo impone el modelo objetivo Qwen3.8-27B que se ejecute en paralelo.
- Opciones de despliegue: exclusivamente QVB8 Inference Engine v1.2.0 o superior. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16 (este paquete) | 267.520 (segun safetensors) | no disponible | QVB8R, 1,5 GB | Apache-2.0 | QVB8 >= 1.2.0 |
| incoai/Qwen3.8-27B-DFlash2 (original) | no disponible | no disponible | bf16 | Apache-2.0 | transformers y otros |
| Qwen3.8-27B_qvb8r_2e-3_fp16 (paquete objetivo) | no disponible | no disponible | QVB8R, 13,6 GB | Apache-2.0 | QVB8 >= 1.2.0 |
| Qwen3.5-9B-DFlash_qvb8_1e-3 (borrador equivalente, modelo menor) | no disponible | no disponible | QVB8, 1,4 GB | Apache-2.0 | QVB8 >= 1.2.0 |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el paquete no carga en transformers ni en otras librerias; sin el motor v1.2.0 o superior es inutilizable.
- La cota L-infinito cubre solo los pesos almacenados: no garantiza que las respuestas del modelo sean identicas a las del original ni correctas. Diferencias de motor, tamano de lote y orden de operaciones en coma flotante producen salidas distintas.
- Modelo borrador: no sirve como modelo generativo autonomo; requiere siempre el paquete objetivo correspondiente.
- Sin datos publicados de sesgos, alucinacion, rendimiento multilingue ni contexto maximo.
- Licencia Apache-2.0 heredada del modelo base; el autor no ofrece garantia alguna y remite al README del motor para el descargo completo.
- Proyecto de un unico investigador independiente: riesgo de mantenimiento y soporte limitados.
- Sin descargas ni likes en el momento de la consulta, lo que impide validar su uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/addiesam/Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16
- Modelo base: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Motor QVB8: https://github.com/addiesam/qvb8
- Paquete objetivo Qwen3.8-27B qvb8r 2e-3: https://huggingface.co/addiesam/Qwen3.8-27B_qvb8r_2e-3_fp16
- Paquete objetivo Qwen3.8-27B qvb8 1e-3: https://huggingface.co/addiesam/Qwen3.8-27B_qvb8_1e-3_fp16
- Borrador Qwen3.5-9B-DFlash: https://huggingface.co/addiesam/Qwen3.5-9B-DFlash_qvb8_1e-3
- Paper I: https://doi.org/10.5281/zenodo.23815007
- Paper II: https://doi.org/10.5281/zenodo.23816044
- Paper III: https://doi.org/10.5281/zenodo.24267208
- Patrocinio: https://github.com/sponsors/addiesam
