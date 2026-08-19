# Ishowbackup/gemma-4-31B-it-uncensored-GGUF

## Resumen

`Ishowbackup/gemma-4-31B-it-uncensored-GGUF` es una cuantización en formato GGUF del modelo `TrevorJS/gemma-4-31B-it-uncensored`, que a su vez es una versión ablacionada (abliteration) de `google/gemma-4-31B-it`. El proceso de abliteración elimina el comportamiento de rechazo (refusal) del modelo instructo, de modo que responde a solicitudes que normalmente serían bloqueadas por las políticas de seguridad del modelo original. El autor de esta cuantización es Ishowbackup, y el modelo base fue desarrollado por TrevorJS.

El modelo tiene aproximadamente 30.7 mil millones de parámetros y se distribuye en dos archivos GGUF: Q4_K_M (18.7 GB) y Q8_0 (32.6 GB). Está pensado para ejecutarse localmente mediante `llama.cpp` o herramientas compatibles, como `llama-server`. La licencia es Apache-2.0, lo que permite uso comercial, aunque el contenido generado puede ser problemático debido a la eliminación de los mecanismos de rechazo.

La relevancia de este modelo radica en su utilidad para casos donde se requiere una generación de texto sin restricciones de contenido, como escritura creativa, investigación sobre seguridad de IA o desarrollo de agentes conversacionales con menos filtros. Sin embargo, debe usarse con precaución, ya que la abliteración también elimina salvaguardas importantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada (el ejemplo de uso emplea 8192 tokens) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base `google/gemma-4-31B-it` en la documentación proporcionada. Se trata de un modelo de lenguaje de 31B parámetros, presumiblemente basado en la arquitectura Transformer, pero este dato no se confirma en la ficha. El proceso de abliteración aplicado por TrevorJS utiliza una técnica denominada *norm-preserving biprojected abliteration*, que elimina las direcciones del espacio latente asociadas al comportamiento de rechazo. Este método conserva las normas de los vectores, minimizando la degradación del rendimiento general.

No se han publicado detalles sobre los datos de entrenamiento del modelo original ni sobre el proceso de ajuste fino instructo. La cuantización GGUF fue realizada por Ishowbackup a partir de los pesos en bf16 del modelo abliterado. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores a la abliteración.

## Capacidades

- Generación de texto libre en inglés, con un comportamiento de rechazo reducido o eliminado.
- Capacidades conversacionales heredadas del modelo instructo Gemma 4, aunque no se especifican detalles concretos.
- Posibilidad de generar contenido que el modelo original rechazaría (por ejemplo, temas sensibles, violencia, lenguaje explícito, etc.).
- Ejecución local eficiente gracias al formato GGUF, compatible con `llama.cpp`, `llama-server` y otras herramientas de inferencia.
- No se menciona soporte para tool calling, agentes, visión ni otras modalidades.
- Limitado al idioma inglés; no se indica soporte multilingüe.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativas, diálogos o poesía sobre temas tabú o controvertidos, gracias a la abliteración que elimina los bloqueos temáticos.
- Desarrollo de juegos de rol o chatbots de ficción: permite crear personajes con respuestas más naturales y menos censuradas, útil para prototipos de entretenimiento.
- Investigación en seguridad y alineación de IA: sirve como caso de estudio para analizar cómo la abliteración afecta al comportamiento del modelo, comparando respuestas antes y después del proceso.
- Generación de datos sintéticos para entrenamiento: puede producir ejemplos de texto que incluyan contenido no deseado, útiles para entrenar clasificadores de moderación o sistemas de filtrado.
- Despliegue local en entornos aislados: al ser un GGUF, se puede ejecutar en CPU o GPU sin conexión a internet, adecuado para entornos con requisitos estrictos de privacidad.
- Evaluación de técnicas de cuantización: permite comparar la calidad de las cuantizaciones Q4_K_M y Q8_0 en tareas de generación de texto, midiendo la pérdida de precisión frente al modelo en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para la cuantización Q4_K_M (18.7 GB): se estima un uso de VRAM de aproximadamente 20-22 GB durante la inferencia, incluyendo overhead del runtime. Es ejecutable en GPUs de consumo como la RTX 3090 (24 GB) o RTX 4090 (24 GB). También puede correr en CPU con al menos 32 GB de RAM, aunque con mayor latencia.
- Para la cuantización Q8_0 (32.6 GB): se requieren al menos 34-36 GB de VRAM. Es adecuado para GPUs profesionales como A100 40GB o H100 80GB. En CPU, se necesitarían 48 GB de RAM o más.
- Opciones de despliegue: `llama.cpp` (incluido `llama-server`), `Ollama` (si se convierte el GGUF a un formato compatible), `llama-cpp-python` para integraciones en Python, o servidores basados en GGUF como `text-generation-webui`.
- La latencia y el throughput dependen del hardware. En una RTX 4090 con Q4_K_M, se pueden esperar velocidades de generación de 20-40 tokens por segundo; en CPU, significativamente menores (2-8 tokens por segundo). Estos valores son estimaciones orientativas, no datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, se puede contextualizar frente a otras versiones de Gemma 4 o modelos abliterados, pero no hay datos objetivos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que puede generar contenido dañino, ilegal o éticamente problemático. El uso responsable es responsabilidad del usuario.
- No se han publicado evaluaciones de seguridad ni benchmarks de rendimiento, por lo que se desconoce el impacto real de la abliteración en la calidad y en la seguridad del modelo.
- Solo soporta inglés; no es adecuado para aplicaciones multilingües.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o políticas de plataformas.
- Al ser una cuantización, puede existir una ligera degradación en la calidad de generación respecto al modelo en bf16, especialmente en la versión Q4_K_M.
- No se especifica la longitud de contexto máxima oficial; el ejemplo de uso emplea 8192 tokens, pero podría ser mayor o menor según la implementación.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/Ishowbackup/gemma-4-31B-it-uncensored-GGUF)
- [Modelo base abliterado (bf16)](https://huggingface.co/TrevorJS/gemma-4-31B-it-uncensored)
- [Modelo original de Google](https://huggingface.co/google/gemma-4-31B-it)
- [Repositorio de abliteración de TrevorJS](https://github.com/TrevorS/gemma-4-abliteration)
