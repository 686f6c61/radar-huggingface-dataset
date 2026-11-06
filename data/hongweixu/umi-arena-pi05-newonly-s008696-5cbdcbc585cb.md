# HongWeiXu/umi-arena-pi05-newonly-s008696-5cbdcbc585cb

## Resumen

El modelo `umi-arena-pi05-newonly-s008696-5cbdcbc585cb` es un checkpoint de inferencia publicado por el usuario HongWeiXu en Hugging Face, derivado de la familia pi05 (π0.5) y preparado específicamente para la evaluación en la competición UMI Arena. No se trata de un modelo de lenguaje generativo al uso, sino de una política de control robótico (policy) exportada en formato safetensors que consume dos imágenes RGB de muñeca y un estado nativo de 9 dimensiones para producir acciones motoras de 32 filas por 16 columnas.

El checkpoint corresponde al paso de entrenamiento 8696 y su nombre codifica esa información (`s008696`), junto con un hash de commit (`5cbdcbc585cb`). El autor advierte explícitamente de que este paquete es únicamente un candidato de inferencia y no una política validada ni presentada oficialmente, y que no se ha medido el éxito real en robot con este artefacto.

La relevancia de esta ficha es acotada: se trata de un artefacto de competición con documentación mínima, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Resulta útil para quien participe en UMI Arena o quiera inspeccionar el formato de exportación de políticas pi05, pero no debe confundirse con un modelo base de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control derivada de pi05; no se detalla en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que se aplican los términos del modelo upstream, tokenizer, software y dataset) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 14,5 GB |
| Paso de checkpoint | 8696 |
| Entradas | 2 imágenes RGB de muñeca + estado nativo 9D |
| Salidas | acciones nativas de 32 x 16 filas |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-02 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada. El nombre del repositorio hace referencia a pi05, lo que sugiere que deriva de la familia de políticas π0.5, pero la model card no describe capas, tipo de transformer, mecanismo de atención ni estrategia de fusión multimodal. Tampoco se indica el número de parámetros ni si emplea algún esquema de mezcla de expertos.

Respecto al entrenamiento, solo se conoce el paso del checkpoint (8696) y la configuración de entrada-salida: dos cámaras RGB de muñeca y un vector de estado de 9 dimensiones como observación, y un tensor de acciones de 32 x 16 como objetivo. No se especifican el volumen de datos, la composición del dataset, ni si hubo etapas de ajuste fino con preferencias o refuerzo. El autor remite a los términos del modelo upstream para cualquier detalle adicional.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones motoras a partir de observaciones visuales y de estado proprioceptivo.
- Fusión multimodal visión-estado: combina dos vistas RGB de muñeca con un vector de estado de 9 dimensiones.
- Producción de acciones nativas con forma 32 x 16, orientada a la interfaz de evaluación de UMI Arena.
- No se documentan capacidades de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, agentes multi-paso ni multilingüismo.
- No se documentan modos especiales como thinking mode, visión de propósito general, audio u otras modalidades.

## Casos de uso

- Evaluación en UMI Arena: el artefacto está empaquetado para ser cargado por el arnés de evaluación de la competición y comparar el paso 8696 frente a otros checkpoints de la misma familia.
- Investigación en políticas visomotoras: sirve para inspeccionar cómo se serializa una política pi05 en safetensors (entradas de imagen, estado 9D y tensor de acciones 32 x 16) sin necesidad de reentrenar.
- Reproducción de experimentos: al estar identificado por paso y hash de commit, permite fijar una versión concreta en pipelines de evaluación reproducibles.
- Análisis de formato de exportación: útil para desarrolladores que construyan conversores entre el formato nativo de pi05 y otros runners de inferencia robótica.
- Punto de partida para ajuste fino: aunque no se documenta el proceso, el checkpoint puede servir como inicialización en experimentos propios, siempre respetando los términos del modelo upstream.
- Docencia y divulgación: ejemplo real de artefacto de competición con metadatos mínimos, útil para explicar buenas prácticas de documentación de políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el éxito oficial en robot no ha sido medido por este paquete y que se trata de un candidato de inferencia, no de una política validada ni presentada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (14,5 GB) da una cota inferior aproximada del espacio en disco necesario, pero no permite derivar la VRAM sin conocer la arquitectura y el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no puede afirmarse que quepa en tarjetas tipo RTX 4090 sin datos de arquitectura.
- Opciones de despliegue: el formato safetensors es compatible con cargadores estándar de PyTorch y con runners que acepten este formato; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no a políticas de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de la misma familia ni modelos comparables de control robótico con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El autor declara explícitamente que este export no es una política presentada ni validada y que el éxito real en robot no ha sido medido.
- Ausencia total de licencia declarada en el repositorio; para uso comercial es imprescindible verificar los términos del modelo upstream, tokenizer, software y dataset, que el autor indica que siguen aplicándose.
- No se documentan sesgos, pero al ser una política entrenada sobre un dataset no descrito, no puede descartarse un sesgo hacia las condiciones de recogida de esos datos.
- Riesgo de alucinación no aplicable en el sentido de generación de texto; el riesgo equivalente es la producción de acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Sin información sobre idiomas, contexto o cuantizaciones: no apta para casos de uso de lenguaje natural.
- Documentación mínima: sin model card extendida, sin ficha de datos, sin evaluación de seguridad y sin métricas de robustez.
- El tamaño de 14,5 GB y la falta de especificaciones impiden planificar el despliegue en producción con garantías.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HongWeiXu/umi-arena-pi05-newonly-s008696-5cbdcbc585cb
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
