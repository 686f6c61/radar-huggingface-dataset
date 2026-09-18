# Felladrin/halogen-qwen3.5-0.8b

## Resumen

Felladrin/halogen-qwen3.5-0.8b es una conversion no oficial de Qwen3.5-0.8B al contenedor `.hgn` que consume el servidor de inferencia [halogen](https://github.com/peonist-ai/halogen-server), desarrollado por peonist-ai. El autor del repositorio es Felladrin y el modelo base es Qwen/Qwen3.5-0.8B-Base, distribuido por Qwen bajo licencia Apache-2.0. La conversion parte del fichero `Qwen3.5-0.8B-Q8_0.gguf` publicado por ggml-org y produce un unico checkpoint de 336 tensores y 2.054.306.176 bytes, con todas las cargas utiles en bf16.

El interes de esta ficha no esta en la capacidad generativa del modelo, que hoy es nula, sino en su valor como artefacto de validacion de formato. El verificador de checkpoints de halogen acepta el fichero y el servidor arranca detectando correctamente 24 capas y una ventana de contexto de 262144 tokens, pero la primera peticion falla en el kernel de embedding: halogen 0.1.3 esta compilado para Qwen3.8-27B y fija en los valores del 27B el tamano oculto, el tamano intermedio del MLP, la dimension v de DeltaNet y el rango de DeltaNet, mientras que solo el numero de capas se lee del checkpoint. Es, por tanto, un banco de pruebas para el contenedor `.hgn`, no un modelo desplegable.

La relevancia actual es doble. Por un lado documenta con detalle el proceso inverso de conversion desde GGUF (deshacer el +1 en los `norm.weight`, recuperar `A_log` frente a `-exp(A_log)` y reordenar las cabezas V), verificado contra el checkpoint real de Qwen3.8-27B, que existe en ambos formatos. Por otro, sirve como referencia de rendimiento de E/S: el streaming de verificacion alcanza 170,0 GB/s en frio y 180,8 GB/s en caliente, una metrica util para quienes trabajan con carga de pesos en hardware Strix Halo (gfx1151).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con componentes de atencion lineal DeltaNet (inferido de los tensores `linear_attn.norm.weight` y de los parametros DeltaNet v-dim y rank citados en la model card; no confirmado explicitamente por el autor) |
| Parametros totales | Aproximadamente 0,8 mil millones (denominacion del modelo); el fichero contiene 336 tensores y 2.054.306.176 bytes en bf16, con `lm_head.weight` duplicando `embed_tokens.weight` por embeddings atados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262144 tokens, segun la salida del servidor halogen (`ctx 262144`) |
| Tipos de cuantizacion | Solo bf16 en el contenedor `.hgn`; el origen GGUF es Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hgn` (contenedor binario de halogen); origen GGUF (Q8_0) |
| Tamano del repositorio | 2,1 GB |
| Numero de capas | 24 |
| Vocabulario | 248320 tokens (compartido con Qwen3.8-27B; el tokenizer no se incluye en el repositorio) |
| Modelo base | Qwen/Qwen3.5-0.8B-Base |

## Arquitectura y entrenamiento

No se ha realizado ningun entrenamiento ni ajuste fino: se trata de una conversion de formato peso a peso. La model card no describe la arquitectura interna del modelo base mas alla de los elementos que la conversion debe tratar con cuidado. La presencia de tensores `linear_attn.norm.weight`, de una dimension v de DeltaNet y de un rango de DeltaNet indica que Qwen3.5-0.8B combina mecanismos de atencion lineal tipo DeltaNet con otras capas, es decir, un diseno hibrido, pero el autor no detalla la proporcion ni la disposicion de esas capas. Los embeddings estan atados, de modo que el fichero no incluye un tensor `output.weight` y `lm_head.weight` se rellena como copia de `embed_tokens.weight`.

El trabajo tecnico relevante esta en la conversion inversa desde GGUF. El script `conversion/qwen.py` de llama.cpp aplica tres transformaciones que no revierten de forma trivial: suma 1 a cada `norm.weight` excepto `linear_attn.norm.weight`, almacena `-exp(A_log)` en lugar de `A_log`, y reordena las cabezas V cuando el numero de cabezas de clave y de valor difiere. El conversor deshace las tres, y cada inversion se valido contra el checkpoint publicado de Qwen3.8-27B, que existe tanto en `.hgn` como en el formato original, de manera que los valores se compararon contra un `.hgn` real y no contra el propio conversor. Omitir esos tres pasos produce un fichero cuyos bytes son bf16 correctos respecto al GGUF pero en el que cada RMSNorm esta desviado en una unidad.

## Capacidades

- Generacion de texto: no funcional en el estado actual. El servidor arranca y alcanza el estado de escucha, pero la primera peticion provoca un fallo en el kernel de embedding por el desajuste entre las dimensiones fijas de halogen 0.1.3 (calibradas para Qwen3.8-27B) y las del checkpoint de 0,8B.
- Verificacion de integridad de checkpoint: el verificador propio de halogen valida los 336 tensores y confirma coincidencia completa, con un streaming de 2,1 GB en 0,01 s a 170,0 GB/s en frio y 180,8 GB/s en caliente.
- Lectura dinamica del numero de capas: el motor deduce 24 capas del checkpoint y configura la ventana de contexto a 262144 tokens, aunque el resto de hiperparametros permanece fijado.
- Decodificacion especulativa: no disponible en este checkpoint, ya que no incluye drafter. El servidor exige `HALOGEN_DRAFTER=0` porque el drafter por defecto es DFlash2.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Validacion del contenedor `.hgn` en pipelines de publicacion de modelos: el fichero permite comprobar que un conversor produce checkpoints que el verificador de halogen acepta (336 tensores, coincidencia byte a byte) antes de invertir esfuerzo en modelos mayores.
- Pruebas de regresion del servidor halogen: al arrancar correctamente pero fallar en el kernel de embedding, sirve como caso de prueba reproducible para detectar hiperparametros cableados a un tamano concreto y para verificar que la futura lectura dinamica de dimensiones funciona.
- Desarrollo y depuracion de kernels en hardware gfx1151 (Strix Halo): los 2,1 GB de pesos y los 170-180 GB/s de streaming lo convierten en una carga de trabajo ligera y rapida para medir latencias de carga, ancho de banda efectivo y comportamiento de memoria unificada sin necesidad de un modelo de 27B.
- Verificacion de conversores GGUF a `.hgn`: las tres transformaciones documentadas (offset de RMSNorm, `A_log` frente a `-exp(A_log)`, reordenacion de cabezas V) pueden usarse como conjunto de pruebas unitarias, comparando la salida contra el checkpoint de Qwen3.8-27B que existe en ambos formatos.
- Estudio de arquitecturas hibridas con DeltaNet: al conservar los tensores de atencion lineal y sus parametros de rango y dimension v, el checkpoint permite inspeccionar como se materializan esas capas en un modelo pequeno antes de abordar implementaciones completas.
- Docencia y formacion en formatos de pesos: la model card explica de forma trazable que hace llama.cpp al convertir Qwen a GGUF y como deshacerlo, lo que constituye material practico para quien necesita entender la relacion entre pesos originales, GGUF y contenedores propietarios.
- Servicio de inferencia: no recomendado en el estado actual. Para servir Qwen3.5-0.8B conviene usar el GGUF de ggml-org con llama.cpp u otro runtime compatible, no este fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona metricas de verificacion y de E/S:

| Metrica | Valor |
|---|---|
| Tensores verificados | 336 (todos coinciden) |
| Volumen transmitido en verificacion | 2,1 GB |
| Tiempo de verificacion en frio | 0,01 s |
| Throughput de streaming en frio | 170,0 GB/s |
| Throughput de streaming en caliente | 180,8 GB/s |
| Estado de la generacion de texto | No funcional (fallo en el kernel de embedding) |

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 2,1 GB solo para los pesos en bf16, mas el overhead del runtime (memoria de trabajo de los kernels, buffers de Key/Value y espacio del tokenizer). Con la ventana de 262144 tokens configurada, el coste de caché puede dominar el consumo y exceder ampliamente el de los pesos.
- GPU recomendadas: el etiquetado del repositorio apunta a hardware Strix Halo con arquitectura gfx1151 (AMD Ryzen AI Max y su iGPU Radeon 8060S), que es el objetivo declarado de halogen. No hay informacion sobre compatibilidad con CUDA.
- Cabe en GPU de consumo: si, por tamano. Un modelo de 0,8B en bf16 ocupa unos 2,1 GB, por lo que cabe en cualquier GPU con 4 GB o mas de memoria, incluidas integradas. El limite practico no es la memoria sino que halogen 0.1.3 no ejecuta este checkpoint.
- Opciones de despliegue: halogen-server 0.1.3 con la variable `HALOGEN_DRAFTER=0` (arranca, no genera); llama.cpp u otro runtime GGUF usando el fichero original `Qwen3.5-0.8B-Q8_0.gguf` de ggml-org, que es la via funcional.
- Latencia y throughput: no disponibles para generacion. Solo se conocen los 170,0 GB/s (frio) y 180,8 GB/s (caliente) del streaming de verificacion, y el tiempo de 0,01 s para recorrer 2,1 GB.
- Almacenamiento: 2,1 GB para el checkpoint, mas el tokenizer, que no se incluye y debe tomarse del repositorio de Qwen3.8-27B, con el que comparte vocabulario de 248320 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado funcional |
|---|---|---|---|---|---|
| Felladrin/halogen-qwen3.5-0.8b | ~0,8B | 262144 | `.hgn` (bf16) | Apache-2.0 | No genera texto; solo verifica |
| Qwen/Qwen3.5-0.8B-Base | ~0,8B | No disponible | No disponible | Apache-2.0 | Funcional como modelo base; requiere runtime compatible |
| ggml-org/Qwen3.5-0.8B-GGUF | ~0,8B | No disponible | GGUF (Q8_0 y otras) | Apache-2.0 (heredada) | Funcional en llama.cpp y derivados |
| Qwen3.8-27B (referencia interna de halogen 0.1.3) | 27B | No disponible | `.hgn` | No disponible | Funcional en halogen 0.1.3; define los hiperparametros fijos del motor |

La comparacion con alternativas de otros fabricantes en el rango de 0,5-1B no es posible con la informacion disponible: no se han proporcionado datos de benchmarks ni especificaciones de contexto de modelos equivalentes.

## Limitaciones y advertencias

- El modelo no genera texto. Es el caveat principal: el verificador acepta el fichero y el servidor arranca, pero la primera peticion falla en el kernel de embedding.
- El fallo se debe a que halogen 0.1.3 fija el tamano oculto, el tamano intermedio del MLP, la dimension v de DeltaNet y el rango de DeltaNet a los valores de Qwen3.8-27B; solo el numero de capas se lee del checkpoint. Mientras el motor no lea esas dimensiones de forma dinamica, el fichero no sera servible.
- Es obligatorio definir `HALOGEN_DRAFTER=0`. El drafter por defecto es DFlash2 y este checkpoint no lo incluye, por lo que sin esa variable no se alcanza ni el estado de escucha.
- El tokenizer no esta incluido. Debe obtenerse del repositorio de Qwen3.8-27B, que comparte el vocabulario de 248320 tokens. Usar un tokenizer distinto produciria una tokenizacion incorrecta.
- Conversion no oficial y sin afiliacion con peonist-ai. No hay garantia de mantenimiento, de compatibilidad con versiones futuras de halogen ni de que el formato `.hgn` se estabilice.
- Riesgo de alucinacion: no evaluable, ya que el modelo no produce salida. Tampoco hay evaluaciones de sesgo, toxicidad o fidelidad.
- Idiomas soportados: no disponibles. La model card no documenta cobertura linguistica alguna.
- Restricciones de licencia: los pesos son de Qwen y estan bajo Apache-2.0, lo que permite uso comercial. Esa licencia cubre los pesos, no el formato `.hgn` ni el servidor halogen, cuyos terminos no se detallan en la informacion proporcionada.
- Caveat para produccion: el fichero no debe desplegarse en un servicio real. Su uso previsto es el ensayo del formato y la depuracion del motor. Para servir el modelo, la ruta recomendada es el GGUF original con llama.cpp u otro runtime compatible.
- Las cifras de contexto (262144) y de capas (24) provienen de la salida del servidor y de la model card, no de documentacion oficial de Qwen, por lo que conviene contrastarlas antes de dimensionar memoria en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Felladrin/halogen-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- GGUF de origen: https://huggingface.co/ggml-org/Qwen3.5-0.8B-GGUF
- Servidor halogen: https://github.com/peonist-ai/halogen-server
- Papers, blogs, demos y resultados de benchmarks: no disponibles en la informacion proporcionada. Las busquedas web realizadas devolvieron unicamente resultados no relacionados con el modelo (sitios de un broker de trading), por lo que no se ha podido recopilar documentacion adicional.
