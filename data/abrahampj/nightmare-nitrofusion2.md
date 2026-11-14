# AbrahamPJ/nightmare-nitrofusion2

## Resumen

Nightmare Nitrofusion2 es una redistribución en formato GGUF del modelo ChenDY/NitroFusion2, un modelo de generación de imágenes derivado de Z-Image Turbo que opera en uno o dos pasos de inferencia. Lo publica el usuario AbrahamPJ bajo el identificador `AbrahamPJ/nightmare-nitrofusion2` y no se trata de un modelo nuevo entrenado desde cero, sino de una recuantización del checkpoint original orientada a un entorno de ejecución concreto: Nightmare Mobile, una aplicación que ejecuta modelos en GPUs Adreno mediante OpenCL y en NPUs antiguas.

El problema que resuelve es de compatibilidad de hardware. El GGUF Q4_0 publicado por el autor original (`nf2-Q4_0.gguf`) mezcla en realidad tipos q5_1 y q4_1 en la mayoría de sus tensores, lo que rompe los kernels que solo implementan matmuls Q4_0 planos. Esta versión se recuantiza desde el `nf2-Q8_0.gguf` upstream aplicando la distribución por tensor del `z_image_turbo-Q4_0.gguf` de leejet: 192 tensores en Q4_0, 10 en Q8_0 (correspondientes al refinador de contexto) y 251 en F32.

La relevancia es acotada pero clara para quien trabaje en inferencia de difusión en dispositivos móviles: permite ejecutar un modelo de generación de imágenes de uno a dos pasos en GPUs integradas que carecen de soporte para cuantizaciones mixtas. La licencia es Apache 2.0, heredada del modelo original, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion derivado de Z-Image Turbo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (192 tensores), Q8_0 (10 tensores), F32 (251 tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ChenDY/NitroFusion2 más allá de su carácter de modelo de difusión para generación de imágenes con muestreo en uno o dos pasos, según la descripción del autor de esta recuantización ("a 1-2 step Z-Image Turbo"). No se detallan el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni si hubo fases de ajuste fino con preferencias humanas.

La intervención técnica de este repositorio es exclusivamente de cuantización. Se parte del `nf2-Q8_0.gguf` upstream, cuyos pesos de matmul están en Q8_0, bf16 y un tensor Q6_K, y se recuantiza siguiendo el redondeo de referencia de ggml. La asignación de tipos por tensor replica la del `z_image_turbo-Q4_0.gguf` de leejet: los tensores de matmul pasan a Q4_0, el refinador de contexto se mantiene en Q8_0 y el resto queda en F32. El objetivo declarado es que el archivo funcione en rutas de ejecución que solo implementan matmuls Q4_0 planos, como OpenCL sobre Adreno y NPUs de generaciones anteriores.

## Capacidades

- Generación de imágenes a partir de prompts de texto, con muestreo en uno o dos pasos de inferencia.
- Ejecución en GPUs móviles Adreno mediante OpenCL, gracias a la uniformidad de tipos Q4_0 en los tensores de matmul.
- Ejecución en NPUs de generaciones anteriores que solo soportan matmuls Q4_0.
- Integración con la aplicación Nightmare Mobile del mismo autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni procesamiento de audio.
- No se documentan capacidades multilingües en la información disponible.

## Casos de uso

- Generación de imágenes en dispositivos móviles Android: el formato Q4_0 uniforme permite ejecutar el modelo en GPUs Adreno a través de OpenCL dentro de Nightmare Mobile, sin necesidad de kernels para cuantizaciones mixtas.
- Prototipado de pipelines de difusión de pocos pasos en hardware de gama baja: al requerir solo uno o dos pasos de muestreo, reduce el coste computacional frente a modelos que necesitan decenas de pasos.
- Despliegue en NPUs heredadas: los equipos que mantienen aceleradores con soporte limitado a matmuls Q4_0 pueden ejecutar este archivo directamente, algo imposible con el GGUF Q4_0 original.
- Investigación sobre cuantización de modelos de difusión: sirve como caso de estudio de recuantización por tensor desde Q8_0/bf16 hacia Q4_0 preservando ciertas capas en mayor precisión.
- Pruebas de compatibilidad de runtimes ggml: útil para validar implementaciones de matmul Q4_0 en backends OpenCL y comparar su comportamiento frente a backends con soporte de tipos mixtos.
- Generación de imágenes offline en entornos sin conectividad: al ser un archivo GGUF autónomo, puede distribuirse con la aplicación y ejecutarse localmente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del archivo y el número de parámetros no se especifican en la información proporcionada.
- GPU recomendadas: no disponibles para el modelo base. El caso de uso declarado son GPUs Adreno con OpenCL y NPUs de generaciones anteriores.
- Cabe en GPU de consumo: no se puede confirmar sin datos de tamaño; el destino declarado son GPUs integradas en dispositivos móviles.
- Opciones de despliegue: Nightmare Mobile (OpenCL sobre Adreno); al ser GGUF, es compatible con runtimes basados en ggml, aunque la uniformidad Q4_0 está pensada específicamente para backends con soporte limitado de tipos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Pasos de muestreo | Licencia | Observaciones |
|---|---|---|---|---|---|
| AbrahamPJ/nightmare-nitrofusion2 | GGUF | Q4_0 / Q8_0 / F32 por tensor | 1-2 | Apache 2.0 | Recuantizado para matmuls Q4_0 planos |
| ChenDY/NitroFusion2 | no disponible | no disponible | 1-2 | no disponible | Modelo base original |
| leejet/Z-Image-Turbo-GGUF | GGUF | Q4_0 (referencia de asignacion por tensor) | no disponible | no disponible | Fuente del esquema de tipos por tensor |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La recuantización a Q4_0 introduce pérdida de precisión respecto al checkpoint Q8_0/bf16 del que parte; no se han publicado evaluaciones de la degradación de calidad resultante.
- El autor no documenta sesgos del modelo base ni evaluaciones de seguridad.
- Riesgo de alucinación visual: no evaluado en la información disponible; los modelos de difusión pueden generar contenido incoherente con el prompt, especialmente en cuantizaciones agresivas.
- No se especifican los idiomas soportados en los prompts.
- La licencia Apache 2.0 permite uso comercial, pero el crédito y las condiciones del modelo original deben respetarse; conviene verificar la licencia de ChenDY/NitroFusion2, que no se detalla en la información disponible.
- El repositorio no registra descargas ni validación por parte de la comunidad; es un artefacto recién publicado sin evidencia de uso en producción.
- La asignación de tipos está optimizada para un runtime concreto (Nightmare Mobile); en otros backends puede no ofrecer ventajas frente al GGUF original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AbrahamPJ/nightmare-nitrofusion2
- Modelo base: https://huggingface.co/ChenDY/NitroFusion2
- Referencia de cuantización: https://huggingface.co/leejet/Z-Image-Turbo-GGUF
- Aplicación Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
