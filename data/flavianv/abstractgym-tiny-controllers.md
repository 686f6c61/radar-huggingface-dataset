# flavianv/abstractgym-tiny-controllers

## Resumen

AbstractGym tiny controllers es una coleccion de doce transformadores pequenos entrenados de forma independiente por el autor flavianv, publicados como artefactos de investigacion para el proyecto AbstractGym. No es un modelo de lenguaje de proposito general: cada checkpoint resuelve una tarea sintetica concreta de seguimiento de estado abstracto sobre alfabetos de simbolos, y se distribuye como pesos completos (no adaptadores) para reproducir los experimentos del proyecto.

La familia se divide en cuatro grupos: control por paso con mapeo de roles (A6 step), control de respuesta directa (A6 direct), un modelo de traza completa autoregresiva (X4 trace) y una ablacion de paso sobre simbolos crudos sin preprocesamiento de roles (X6 raw-step). Cada familia tiene tres semillas (0, 1, 2), sumando doce modelos. La relevancia es metodologica: permiten medir cuanto de la ejecucion correcta depende del mapeo de roles privilegiado frente al binding de simbolos crudos, un problema central en interpretabilidad y computacion abstracta.

Arquitectura uniforme y minima: dos capas Transformer, ancho 64, cuatro cabezas, FFN de 128, GELU, pre-norm, posiciones sinusoidales (maximo 256) y precision FP32. El tamano es del orden de decenas de miles de parametros, por lo que el interes no es la capacidad generativa sino la limpieza experimental y la verificacion bit a bit de la conversion a safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder minimo: 2 capas, ancho 64, 4 cabezas, FFN 128, GELU, pre-norm, posiciones sinusoidales (max. 256), FP32. Step/direct usan atencion bidireccional con clasificacion CLS; trace/raw-step usan atencion causal con salidas autoregresivas |
| Parametros totales | no disponible (arquitectura de 2 capas, ancho 64, 4 cabezas, FFN 128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 posiciones maximas (posiciones sinusoidales) |
| Tipos de cuantizacion | no disponible (pesos en FP32; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta declarada); en la practica opera sobre secuencias de simbolos, no lenguaje natural |
| Licencia | MIT |
| Formato de pesos | safetensors (cada carpeta incluye model.safetensors, config.json, training.json, results.json y registro de verificacion de conversion) |

## Arquitectura y entrenamiento

Los doce modelos comparten la misma arquitectura de dos capas Transformer con ancho 64, cuatro cabezas de atencion, feed-forward de ancho 128, activacion GELU, dropout cero, pre-normalizacion y codificacion posicional sinusoidal con maximo de 256 posiciones, todo en FP32. La diferencia funcional esta en el tipo de atencion y la cabeza de salida: los modelos step y direct emplean atencion bidireccional con una cabeza de clasificacion sobre el token CLS, mientras que trace y raw-step usan atencion causal con generacion autoregresiva de la secuencia de acciones.

El entrenamiento se realizo desde cero (no se menciona RLHF, DPO ni ajuste fino) con AdamW, learning rate 0.001, weight decay 0.01, clipping de gradiente 1 y decaimiento coseno hasta 1e-5. Los modelos step y raw-step se entrenaron con 800 actualizaciones de batch completo sobre 36 estados; direct y trace con 1.500 actualizaciones y batch balanceado de 64. La division de datos parte de 367 trayectorias sobre el alfabeto uvwxy y profundidades 0-4: el entrenamiento de step deduplica los estados de prefijo a 36 observaciones con roles, mientras que direct usa las 367 muestras de pertenencia con muestreo de etiquetas balanceado. El conjunto de retencion original tiene 92 casos en dos alfabetos distintos y profundidades 0/1/2/3/4/8/16, con 32 casos extra a profundidades 32/64 y una comprobacion exhaustiva de 36 estados para los modelos step. La innovacion metodologica es la ablacion X6: elimina el preprocesamiento de roles y expone al modelo a IDs de simbolos crudos imprimibles con un mapa de simbolos suministrado.

## Capacidades

- Clasificacion de paso (A6 step): emite la accion correcta en cada paso a partir de observaciones ya mapeadas a roles; alcanza 92/92 en el conjunto de retencion y en la comprobacion exhaustiva de 36 estados.
- Respuesta directa (A6 direct): juicio binario de pertenencia con cabeza de clasificacion; obtiene entre 76/92 y 80/92 segun semilla.
- Traza completa (X4 trace): genera la secuencia de acciones completa de forma autoregresiva, incluidas continuaciones con historial corrupto y salidas forzadas por profesor; 60/92 en todas las semillas.
- Ablacion de simbolos crudos (X6 raw-step): disenada para eliminar el preprocesamiento de roles; no aprende el binding de simbolos crudos (0/92 en las tres semillas).
- Ejecucion de estado finito: los modelos step requieren ejecucion en vivo completa para puntuar; no hay capacidades de razonamiento general.
- No dispone de tool calling, function calling, uso de agentes, vision, audio, modo pensamiento ni capacidades multilingues.

## Casos de uso

- Reproduccion experimental: cargar los pesos con la arquitectura del codigo publico para replicar exactamente las predicciones guardadas, incluidos los casos con historial corrupto y los estados exhaustivos, gracias a la verificacion bit a bit de la conversion.
- Estudio de interpretabilidad mecanicista: analizar como dos capas de ancho 64 resuelven el seguimiento de estado en el alfabeto uvwxy, sirviendo como banco de pruebas de tamano minimo y totalmente inspeccionable.
- Ablacion de preprocesamiento privilegiado: comparar el rendimiento de los modelos con mapeo de roles (92/92 en step) frente al modelo de simbolos crudos (0/92) para cuantificar cuanto depende la tarea del andamiaje externo.
- Control de referencia en experimentos de neurosimbolismo: usar los controladores como linea base determinista frente a metodos que aprenden el binding de simbolos sin mapa suministrado.
- Validacion de pipelines de serializacion: emplear el registro conversion_verification.json y los manifiestos de hash para comprobar que la serializacion a safetensors preserva los valores tensor a tensor.
- Material didactico: ilustrar con un modelo entrenable en CPU los conceptos de atencion bidireccional frente a causal, clasificacion CLS y decodificacion autoregresiva.
- Prueba de robustez posicional: los casos extra a profundidades 32 y 64 permiten evaluar la degradacion con secuencias mas alla del rango de desarrollo (0-4).

## Benchmarks y rendimiento

Resultados exactos de retencion copiados de `docs/results/2026-10-03-a6`, metadatos X4 y `docs/results/2026-10-04-x6`. La metrica es aciertos sobre un total de 92 casos. Las tareas e interfaces no son comparables entre familias: step/raw-step exigen ejecucion en vivo completa, direct es pertenencia binaria y trace exige la secuencia de acciones completa generada. Todas las fallas permanecen en el denominador.

| Familia | Semilla | Aciertos / casos |
|---|---|---|
| step | 0 | 92/92 |
| step | 1 | 92/92 |
| step | 2 | 92/92 |
| direct | 0 | 76/92 |
| direct | 1 | 80/92 |
| direct | 2 | 76/92 |
| trace | 0 | 60/92 |
| trace | 1 | 60/92 |
| trace | 2 | 60/92 |
| raw-step | 0 | 0/92 |
| raw-step | 1 | 0/92 |
| raw-step | 2 | 0/92 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: practicamente despreciable. El repositorio ocupa 0.0 GB y los pesos estan en FP32 con una arquitectura de decenas de miles de parametros, por lo que el modelo cabe con holgura en memoria de sistema.
- GPU recomendadas: no se requiere GPU. La inferencia puede ejecutarse en CPU; cualquier GPU consumer (por ejemplo, RTX 4090 o inferior) es sobredimensionada para esta carga.
- Cabe en GPU consumer: si, en cualquier GPU consumer y tambien en CPU, dado el tamano minimo del modelo.
- Opciones de despliegue: no esta pensado para servidores de inferencia genericos. La carga se realiza con PyTorch y safetensors mediante la clase `TinyTransformer` (o `TraceTransformer` / `RawTransformer`) del codigo publico, no con AutoModel raiz de transformers. vLLM, llama.cpp, Ollama o TGI no estan soportados por tratarse de modelos PyTorch personalizados.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria; se trata de controladores sinteticos de investigacion entrenados a medida para AbstractGym, sin equivalente directo entre los modelos de lenguaje o de razonamiento publicos.

## Limitaciones y advertencias

- Solo hay tres semillas por familia, lo que limita la significacion estadistica de las conclusiones.
- Los modelos con mapeo de roles dependen de preprocesamiento privilegiado: un paso correcto no demuestra binding aprendido de simbolos crudos.
- La ablacion de simbolos crudos (raw-step) no transfiere de forma fiable y falla por completo (0/92) en el conjunto de retencion.
- Las pruebas son sinteticas y finitas, con posiciones acotadas y una maquina de estados externa que no demuestran computacion general.
- No es un modelo de lenguaje: no genera texto natural, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks estandar de LLM.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero las salidas autoregresivas de la familia trace pueden generar secuencias de acciones incorrectas sin senal de incertidumbre.
- Licencia MIT, permisiva para uso comercial. No se publican archivos pickle ni estados del optimizador.
- Los modelos se distribuyen como checkpoints PyTorch personalizados; requieren el codigo de soporte y los vocabularios registrados en config.json, por lo que no funcionan con cargadores genericos.

## Enlaces

- HuggingFace: https://huggingface.co/flavianv/abstractgym-tiny-controllers
- Codigo fuente: https://github.com/flavianv/abstractgym-public/tree/main
- Paper: no disponible
- Blog o demo: no disponible
