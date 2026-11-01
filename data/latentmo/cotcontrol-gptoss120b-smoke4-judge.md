# latentMO/cotcontrol-gptoss120b-smoke4-judge

## Resumen

smoke4-judge es un adaptador LoRA de rango 32 sobre el modelo base openai/gpt-oss-120b, publicado por el usuario latentMO en HuggingFace. Forma parte de una serie de "organismos modelo" (model organisms) generados durante un sprint MATS centrado en la controlabilidad de la cadena de pensamiento (CoT, chain-of-thought): el objetivo del entrenamiento es que el modelo siga instrucciones sobre su propio rastro de razonamiento, incluyendo variantes de ofuscación, OPSD y experimentos con múltiples tipos de razonamiento. Se trata, por tanto, de un artefacto de investigación y no de un modelo destinado a producción.

El repositorio contiene un unico checkpoint exportado (`step2/`) en formato PEFT, junto con un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento en Tinker (ya eliminadas). El adaptador se distribuye bajo licencia Apache 2.0 y ocupa 5,3 GB en el repositorio, aunque al ser un adaptador LoRA no incluye los pesos completos del modelo base, que debe descargarse por separado desde openai/gpt-oss-120b.

La relevancia de este artefacto es acotada y experimental: sirve para estudiar si un modelo grande puede controlar y modular su propio rastro de razonamiento bajo instrucción, un tema central en seguridad de IA y en la interpretabilidad de modelos con modo "thinking". No dispone de descargas ni de validación externa, y el propio autor advierte explícitamente de que no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer de openai/gpt-oss-120b; rango 32 |
| Parametros totales | no disponible (adaptador LoRA; el base gpt-oss-120b es MoE de 120B según su model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada aquí) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizaciones del base no documentadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker y empaquetado con la librería PEFT. No se especifica en la información disponible la arquitectura interna del modelo base más allá de su identificador (openai/gpt-oss-120b); el adaptador modifica únicamente un subconjunto de pesos de dicho modelo, por lo que su comportamiento final depende enteramente del base sobre el que se aplique.

El entrenamiento se enmarca en un sprint MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones acerca de su propio rastro de razonamiento, con variantes de ofuscación, OPSD y experimentos con múltiples tipos de razonamiento. El código de entrenamiento, la configuración y las evaluaciones están publicados en el repositorio de GitHub del autor (`cot-control/rl/` y `cot-control/results/rl/smoke4-judge/`), junto con un diario de ejecuciones en `runs/`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Control de la cadena de pensamiento: el adaptador está entrenado para seguir instrucciones sobre cómo debe desarrollarse su propio rastro de razonamiento.
- Variantes de ofuscación y OPSD: la serie de experimentos incluye configuraciones para estudiar la ocultación o modulación del razonamiento.
- Razonamiento multi-paso: heredado del modelo base gpt-oss-120b, aunque no se documentan evaluaciones específicas en este repositorio.
- Generación de texto: capacidad heredada del base; no se documentan capacidades adicionales (código, matemáticas, visión) en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking: el objeto de estudio del adaptador es precisamente la gestión del rastro de razonamiento, pero no se especifica el mecanismo exacto en la model card.

## Casos de uso

- Investigación en seguridad de IA: estudiar si un modelo grande puede controlar y modular su propio rastro de razonamiento bajo instrucción, usando el adaptador como organismo modelo en experimentos reproducibles.
- Experimentos de interpretabilidad de CoT: analizar cómo cambia el razonamiento del modelo cuando se le pide ofuscar, acortar o reestructurar su cadena de pensamiento.
- Evaluación de robustez de salvaguardas: probar si las instrucciones sobre el razonamiento pueden eludir mecanismos de monitorización de CoT en pipelines de auditoría.
- Reproducción de resultados académicos: el repositorio de GitHub incluye configuración, checkpoints y diario de ejecuciones, lo que permite replicar el sprint MATS en entornos de investigación.
- Estudio de adaptadores LoRA sobre modelos MoE de gran tamaño: analizar el efecto de un adaptador de rango 32 sobre un base de 120B en tareas de control de razonamiento.
- Docencia y formación: utilizar el artefacto como ejemplo práctico de organismos modelo y de evaluación de riesgos en cursos de seguridad de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base openai/gpt-oss-120b, cuyos requisitos no se documentan en este repositorio.
- GPU recomendadas: no disponibles en la información proporcionada; un base de 120B requiere, en la práctica, hardware de clase A100/H100 o superior, pero este dato no está confirmado en la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador es compatible con PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada adaptadores comparables de control de CoT sobre gpt-oss-120b ni se documentan métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy"; no debe usarse en producción.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso o evaluación independiente.
- Trazabilidad limitada: las rutas originales del sampler y del estado de entrenamiento en Tinker han sido eliminadas, por lo que la reproducibilidad depende del código y la configuración publicados en GitHub.
- Sesgos: no documentados en la información disponible; al heredar el comportamiento del base, puede reproducir sus sesgos.
- Riesgo de alucinación: no evaluado en este repositorio; el foco del entrenamiento es el control del razonamiento, no la factualidad.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base está sujeto a su propia licencia, que debe verificarse por separado.
- Un único checkpoint (`step2/`): no hay comparación entre pasos de entrenamiento ni curva de aprendizaje publicada en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-smoke4-judge
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys
