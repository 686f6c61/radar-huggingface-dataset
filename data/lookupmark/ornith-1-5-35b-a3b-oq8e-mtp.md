# LookUpMark/Ornith-1.5-35B-A3B-oQ8e-mtp

## Resumen

`LookUpMark/Ornith-1.5-35B-A3B-oQ8e-mtp` es una cuantización MLX de 8 bits del modelo `ornith-ai/Ornith-1.5-35B-A3B`, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con aproximadamente 35.950 millones de parámetros totales y unos 3.000 millones de parámetros activos por token. La cuantización ha sido realizada por el usuario LookUpMark con la herramienta oQ (oMLX v0.6.4) en formato de precisión mixta, con grupo de 64 y una profundidad especulativa de 3 tokens mediante Multi-Token Prediction (MTP). El modelo base, desarrollado por el equipo Ornith, extiende Ornith-1.0 (construido sobre Qwen3.5 y Gemma4) mediante un bucle de auto-mejora end-to-end. Esta versión cuantizada está pensada específicamente para ejecución local en Macs con Apple Silicon, ofreciendo una alternativa eficiente en memoria para tareas de generación de texto conversacional. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (qwen3_5_moe) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3.000 millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit (oQ8e), precision mixta, grupo de 64 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (8 shards) |

## Arquitectura y entrenamiento

El modelo base `ornith-ai/Ornith-1.5-35B-A3B` utiliza una arquitectura MoE denominada `qwen3_5_moe`, en la que solo se activan aproximadamente 3.000 millones de parámetros por token, lo que reduce el coste computacional en comparación con un modelo denso del mismo tamaño total. Esta cuantización concreta no modifica la arquitectura, pero aplica una cuantización de 8 bits con precisión mixta (oQ8e) y grupo de 64, junto con un mecanismo de Multi-Token Prediction (MTP) de profundidad especulativa 3, diseñado para acelerar la decodificación en hardware Apple Silicon mediante oMLX.

Según la información disponible, el modelo base Ornith-1.5 se entrenó a partir de Ornith-1.0 (que a su vez se basa en Qwen3.5 y Gemma4) mediante un bucle de auto-mejora end-to-end. No se detallan el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, orientada a tareas de chat y asistencia.
- Decodificacion especulativa mediante Multi-Token Prediction (MTP) con profundidad 3, que permite generar varios tokens por paso y reducir la latencia en Apple Silicon.
- Ejecucion eficiente en Macs con chips Apple Silicon gracias a la cuantizacion MLX de 8 bits y al uso de la libreria oMLX.
- Compatibilidad con el ecosistema MLX (mlx-lm, oMLX server) para inferencia local.
- No se especifican en la informacion disponible capacidades de tool calling, agentes, vision, audio ni razonamiento multi-step.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse mediante un servidor oMLX en un Mac con Apple Silicon, ofreciendo un chat privado sin necesidad de conexion a internet. La cuantizacion de 8 bits reduce el uso de memoria unificada frente al modelo original.
- Prototipado de aplicaciones de IA en macOS: al estar en formato MLX safetensors, se integra directamente con herramientas como mlx-lm, lo que facilita experimentar con un modelo MoE de 35B en un equipo de sobremesa.
- Procesamiento de texto en entornos sensibles: al ejecutarse de forma local, los datos no salen del dispositivo, lo que resulta adecuado para aplicaciones de redaccion o analisis de documentos con requisitos de confidencialidad.
- Investigacion sobre cuantizacion y modelos MoE: permite estudiar el efecto de la cuantizacion de 8 bits y del MTP en el rendimiento y la calidad de salida de un modelo con 3B de parametros activos.
- Despliegue de servicios de inferencia en infraestructura Apple: gracias a su licencia MIT, puede integrarse en productos comerciales sin restricciones de licencia, siempre que se respete el aviso de copyright.
- Herramientas de productividad personal: el modelo puede usarse para redactar correos, resumir textos o generar borradores en aplicaciones nativas de macOS, aprovechando la baja latencia que proporciona el MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos cuantizados ocupan aproximadamente 38,6 GB, por lo que se recomienda un Mac con al menos 48 GB de memoria unificada para cargar el modelo junto con las activaciones y el cache KV.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. No se especifican modelos concretos.
- No es compatible con GPU NVIDIA o AMD; el formato MLX esta orientado exclusivamente a Apple Silicon.
- Opciones de despliegue: oMLX server, mlx-lm y otras herramientas del ecosistema MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad para esta cuantizacion concreta, por lo que su rendimiento real no esta validado.
- Es una cuantizacion creada por un tercero (LookUpMark) y no por el equipo original de Ornith; pueden existir diferencias de comportamiento respecto al modelo base sin cuantizar.
- La longitud de contexto y los idiomas soportados no estan especificados, lo que obliga a verificar estos parametros antes de usar el modelo en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente y poco probado.
- Aunque la licencia es MIT y permite uso comercial, el modelo puede generar contenido incorrecto o alucinado; se recomienda supervisar las salidas en aplicaciones criticas.
- No se indican sesgos conocidos ni restricciones adicionales de seguridad en la informacion disponible.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/LookUpMark/Ornith-1.5-35B-A3B-oQ8e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog del modelo base: https://deep-reinforce.com/ornith.html
- Blog de ornith.ai: https://ornith.ai/ornith_1_5.html
- Herramienta de cuantizacion oMLX: https://github.com/jundot/omlx
