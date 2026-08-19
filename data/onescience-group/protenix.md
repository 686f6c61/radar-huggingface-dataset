# OneScience-Group/protenix

## Resumen

Protenix es un modelo de predicción de estructuras de complejos biomoleculares desarrollado por OneScience-Group, inspirado en AlphaFold 3. Su objetivo es predecir la estructura tridimensional de complejos formados por proteínas, ácidos nucleicos, ligandos y otras moléculas a partir de una descripción molecular en formato JSON y características MSA generadas localmente. El modelo genera archivos CIF con las estructuras predichas y puntuaciones de confianza en JSON.

El modelo emplea una red de representación Pairformer y un Transformer de difusión a nivel de átomo, lo que permite tratar de forma unificada proteínas, ácidos nucleicos y ligandos dentro de un mismo marco. El paquete distribuido en Hugging Face incluye código, configuraciones, ejemplos de entrada, scripts de inferencia, entrenamiento y fine-tuning, así como los pesos preentrenados, lo que facilita su validación local inmediata y su integración en entornos de automatización como OneCode. La licencia Apache 2.0 permite uso académico y comercial sin restricciones.

El modelo está pensado para investigadores y desarrolladores en bioinformática estructural, diseño de fármacos y biología computacional. Su relevancia radica en ofrecer una alternativa de código abierto a AlphaFold 3 con capacidades similares y un flujo de trabajo simplificado, aunque el repositorio es reciente y aún no acumula descargas ni métricas de adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pairformer + Transformer de difusión a nivel de átomo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de estructura, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (documentación y soporte del paquete) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se incluyen en el directorio `weights/` del paquete) |

## Arquitectura y entrenamiento

Protenix utiliza una arquitectura compuesta por una red de representación Pairformer y un Transformer de difusión a nivel de átomo. El Pairformer se encarga de modelar las interacciones entre pares de residuos o átomos, mientras que el Transformer de difusión genera las coordenadas atómicas mediante un proceso de denoising. Esta combinación permite tratar de forma unificada proteínas, ácidos nucleicos, ligandos y otros componentes de un complejo biomolecular.

No se han proporcionado detalles sobre el número de parámetros, la cantidad de tokens de entrenamiento ni la composición del dataset. La model card menciona un dataset asociado (`OneScience-Group/protenix_dataset`) y scripts para entrenamiento y fine-tuning, pero no especifica el volumen de datos ni el procedimiento de entrenamiento (por ejemplo, si se usó aprendizaje por refuerzo o ajuste fino supervisado). El paquete incluye pesos preentrenados listos para usar.

## Capacidades

- Predicción de estructuras tridimensionales de complejos biomoleculares (proteínas, ácidos nucleicos, ligandos y otras moléculas).
- Generación de archivos CIF con las coordenadas atómicas predichas.
- Producción de puntuaciones de confianza en formato JSON.
- Acepta como entrada un archivo JSON con la descripción molecular y características MSA generadas localmente.
- Soporta inferencia, entrenamiento desde cero y fine-tuning mediante scripts incluidos en el paquete.
- Compatible con GPU NVIDIA y GPU Hygon DCU (con DTK instalado).
- No es un modelo de lenguaje; no ofrece generación de texto, tool calling ni capacidades de agente.

## Casos de uso

- Predicción de estructuras de complejos proteína-ligando: el modelo puede predecir cómo se une un fármaco candidato a una proteína diana, lo que es útil en el descubrimiento de fármacos.
- Estudio de interacciones proteína-ácido nucleico: permite modelar complejos como ribosomas o factores de transcripción unidos a ADN/ARN.
- Validación de paquetes de software en entornos de integración continua: el script `preflight.py` permite comprobar rápidamente que el modelo, los pesos y las importaciones funcionan correctamente.
- Automatización de pipelines de biología estructural: la integración con OneCode facilita la ejecución de inferencias en entornos en la nube sin configuración manual.
- Fine-tuning para dominios específicos: los scripts de fine-tuning permiten adaptar el modelo a familias de proteínas o tipos de complejos particulares.
- Entrenamiento desde cero con datasets propios: el paquete incluye soporte para entrenamiento en una sola GPU, útil para investigación académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Se recomienda GPU o DCU; una CPU puede ejecutar el modelo pero con rendimiento muy lento.
- Para GPU Hygon DCU es necesario instalar DTK 25.04.2 o superior (o una versión recomendada por OneScience).
- No se especifica la VRAM mínima ni GPUs concretas recomendadas.
- El tamaño del repositorio es de 1.5 GB, lo que sugiere que los pesos son relativamente compactos, pero no se dispone de datos exactos de memoria.
- Opciones de despliegue: el paquete incluye scripts de inferencia (`inference_unified_demo.sh`) y entrenamiento (`train_demo.sh`), y puede ejecutarse en entornos locales o en la nube mediante OneCode.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa. Protenix se presenta como un modelo similar a AlphaFold 3, pero no se han publicado métricas comparativas. Alternativas conocidas en el mismo dominio son AlphaFold 3 (de Google DeepMind) y RoseTTAFold All-Atom, aunque no se dispone de datos concretos de rendimiento para comparar en esta ficha.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes ni benchmarks, por lo que se desconoce su precisión relativa frente a AlphaFold 3 u otros modelos.
- El modelo puede tener limitaciones en la predicción de complejos muy grandes o con modificaciones postraduccionales inusuales, aunque no se documentan explícitamente.
- La documentación está disponible en inglés y chino; no hay garantía de soporte en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el proyecto es reciente (creado en julio de 2026) y no hay evidencia de adopción o mantenimiento activo más allá del repositorio inicial.
- Para usuarios de DCU, se requiere contacto con OneScience para obtener información adicional sobre la adaptación, lo que puede suponer una barrera técnica.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/protenix
- Dataset en HuggingFace: https://huggingface.co/datasets/OneScience-Group/protenix_dataset
- Repositorio principal OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades OneScience (Gitee): https://gitee.com/onescience-ai/oneskills
- Repositorio principal OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de habilidades OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Licencia Apache 2.0 (referencia): https://github.com/bytedance/Protenix/blob/main/LICENSE
