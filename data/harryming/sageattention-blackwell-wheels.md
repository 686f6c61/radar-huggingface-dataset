# harryming/sageattention-blackwell-wheels

## Resumen

El repositorio `harryming/sageattention-blackwell-wheels` no contiene un modelo de IA, sino un conjunto de ruedas (wheels) precompiladas de las bibliotecas SageAttention 2 y 3, diseñadas específicamente para arquitectura NVIDIA Blackwell con CUDA 13. Estas ruedas permiten instalar de forma directa una implementación optimizada de atención eficiente en entornos Linux x86_64 con Python 3.12 y PyTorch 2.10.0. El autor, harryming, las compiló a partir del código fuente oficial del proyecto thu-ml/SageAttention, y las utiliza en un pipeline de producción de ComfyUI para generación de vídeo con modelos MiniMax H3.

La relevancia de este paquete radica en que SageAttention ofrece una alternativa de atención con cuantización FP4 y kernels optimizados para Blackwell, lo que puede reducir el uso de memoria y acelerar la inferencia en modelos de vídeo de gran tamaño. Al estar precompiladas, evitan al usuario el proceso de compilación local, que suele ser complejo y propenso a errores. Sin embargo, su uso está restringido a un entorno muy concreto (hardware, CUDA, PyTorch y Python específicos), y no se garantiza que funcione fuera de esas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (biblioteca de kernels de atención eficiente) |
| Parametros totales | No disponible (no es un modelo entrenado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP4 (SageAttention 3), así como cuantizaciones internas de SageAttention 2 (no especificadas) |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (wheels de Python, formato .whl) |

## Arquitectura y entrenamiento

SageAttention es una implementación de atención eficiente que optimiza el cálculo de la atención en transformers mediante kernels CUDA especializados. La versión 2.2.0 incluida en este paquete está compilada para el microarquitectura Blackwell `sm_120`, mientras que SageAttention 3 (versión 1.0.0) utiliza `sm_120a` y soporta cuantización FP4. Estas ruedas no son un modelo entrenado, por lo que no hay datos de entrenamiento, tokens ni procesos de RLHF/DPO. La innovación técnica principal es la aceleración de la atención a través de kernels escritos a medida que aprovechan las instrucciones específicas de Blackwell y la reducción de precisión a FP4 para aumentar el rendimiento.

El paquete está pensado para integrarse en ComfyUI mediante el nodo `PathchSageAttentionKJ`, que permite seleccionar entre Sage 2/2++ y Sage 3. Según la documentación, SageAttention 3 puede ser más rápido en Blackwell, pero no se garantiza que sea lossless para todos los modelos de vídeo, por lo que se recomienda comparar la estabilidad temporal, rostros, manos, texto, lip sync y audio antes de sustituir una línea base de Sage 2 en producción.

## Capacidades

- Aceleración de la atención en transformers mediante kernels CUDA optimizados para NVIDIA Blackwell.
- Soporte de cuantización FP4 en SageAttention 3, lo que reduce el uso de memoria y puede aumentar el throughput.
- Integración directa con ComfyUI a través del nodo `PathchSageAttentionKJ` (modos `auto` y `sageattn3`).
- Compatibilidad específica con el entorno: Linux x86_64, Python 3.12, PyTorch 2.10.0, CUDA 13.0.
- Verificación de integridad mediante suma SHA256.
- No es un modelo de lenguaje, por lo que no genera texto, código ni razonamiento.

## Casos de uso

- Generación de vídeo en producción con ComfyUI: el paquete se utiliza en un pod de producción para el modelo MiniMax H3, donde acelera la atención durante la inferencia de vídeo.
- Despliegue de modelos de vídeo en GPUs Blackwell: permite ejecutar modelos grandes con menor huella de memoria gracias a la cuantización FP4 de SageAttention 3.
- Sustitución de implementaciones de atención estándar en pipelines existentes: se puede reemplazar la atención de PyTorch por SageAttention mediante el parche de ComfyUI, manteniendo la configuración `allow_compile=false` como línea base validada.
- Evaluación de rendimiento de atención en hardware Blackwell: los desarrolladores pueden comparar la velocidad y la calidad entre Sage 2 y Sage 3 en sus propios modelos.
- Desarrollo de extensiones de ComfyUI: los nodos que dependen de atención eficiente pueden beneficiarse de estas ruedas precompiladas sin necesidad de compilar desde el código fuente.
- Investigación en eficiencia de atención: el paquete sirve como referencia de compilación para arquitecturas específicas, aunque no incluye el código fuente ni los scripts de compilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo menciona que SageAttention 3 "puede ser más rápido" en Blackwell, pero no proporciona cifras concretas de latencia, throughput o calidad. Tampoco se incluyen comparativas con otras implementaciones de atención.

## Requisitos de hardware

- GPU NVIDIA Blackwell con soporte para `sm_120` (SageAttention 2) y `sm_120a` (SageAttention 3). El autor indica que fue probado en una RTX PRO 6000 Blackwell Server Edition.
- VRAM: no se especifica, pero al ser una biblioteca de atención, la VRAM dependerá del modelo que se ejecute. La cuantización FP4 de SageAttention 3 puede reducir los requisitos de memoria en comparación con FP16.
- No es compatible con GPUs de generaciones anteriores (Ampere, Ada, etc.) ni con CUDA 12.
- Entorno de ejecución: Linux x86_64, Python 3.12, PyTorch 2.10.0, CUDA 13.0.
- Opciones de despliegue: exclusivamente como wheels de Python instalables vía pip. No se mencionan integraciones con vLLM, llama.cpp u otros frameworks de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información para comparar directamente con otras implementaciones de atención eficiente (p. ej., FlashAttention, xFormers, etc.) porque el repositorio no incluye benchmarks ni métricas. Sin embargo, se puede señalar que:

- SageAttention se diferencia de FlashAttention por su soporte de cuantización FP4 y su enfoque en GPUs Blackwell.
- A diferencia de xFormers, SageAttention ofrece kernels específicos para `sm_120a` que aprovechan las instrucciones FP4 de Blackwell.
- No hay datos objetivos de rendimiento, por lo que la comparación numérica no está disponible.

## Limitaciones y advertencias

- Las ruedas son específicas del entorno: solo funcionan en Linux x86_64, Python 3.12, PyTorch 2.10.0, CUDA 13.0 y GPUs Blackwell. Instalarlas en otros entornos puede fallar o producir errores.
- SageAttention 3 no está garantizado como lossless para todos los modelos de vídeo. El autor recomienda verificar la estabilidad temporal, rostros, manos, texto, lip sync y audio antes de usarlo en producción.
- La opción `sageattn3_per_block_mean` no es el valor predeterminado aprobado en este paquete, lo que sugiere posibles problemas de calidad si se activa.
- No se incluye el código fuente ni las instrucciones de compilación; solo las wheels binarias.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido ampliamente probado por la comunidad.
- La licencia Apache-2.0 se aplica al proyecto upstream, pero el autor de este repositorio no proporciona garantías adicionales sobre el binario compilado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/harryming/sageattention-blackwell-wheels
- Proyecto oficial SageAttention: https://github.com/thu-ml/SageAttention
