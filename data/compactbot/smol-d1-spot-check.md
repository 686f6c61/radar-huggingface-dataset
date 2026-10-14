# Compactbot/smol-d1-spot-check

## Resumen

Compactbot/smol-d1-spot-check no es un modelo de lenguaje, sino un repositorio de verificacion acotada (bounded reproducibility probe) publicado por el usuario Compactbot el 13 de octubre de 2026. Su proposito es comprobar de forma reproducible dos afirmaciones externas: que existe el modelo FlameF0X/smol-d1 y que su checkpoint base declarado es SmolLM2-135M de HuggingFaceTB. El autor indica explicitamente que no se trata de un benchmark ni de una reclamacion de calidad.

El hallazgo principal documentado es que el checkpoint base se carga como `LlamaForCausalLM` con 134.515.008 parametros medidos. Con una semilla fija (21) se ejecuto un control de generacion greedy sobre tres ejemplos, que produjo continuaciones cortas. La rama del adaptador no llego a ejecutarse porque Unsloth no estaba instalado en el entorno de prueba, de modo que no se emite ninguna afirmacion de precision ni comparacion sobre el adaptador. Los resultados y las limitaciones se recogen en el fichero `results.json` del repositorio.

Su relevancia es metodologica: sirve como ejemplo minimo de auditoria de reproducibilidad para modelos pequenos y fine-tunes publicados en HuggingFace, y como recordatorio de que la carga del checkpoint y el recuento de parametros deben verificarse antes de dar por buenas las fichas de un modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como modelo propio; el checkpoint base auditado se carga como `LlamaForCausalLM` |
| Parametros totales | 134.515.008 (medidos sobre el checkpoint base auditado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene el script `smol_d1_comparison.py` y `results.json`) |

## Arquitectura y entrenamiento

El repositorio no define ni entrena una arquitectura propia. Lo que documenta es la verificacion de un checkpoint base que, al cargarse, se instancia como `LlamaForCausalLM` con 134.515.008 parametros medidos, coherente con la base declarada SmolLM2-135M. La prueba consiste en un script (`smol_d1_comparison.py`) que descarga localmente ambos repositorios, ajusta las rutas y ejecuta dos ramas: un control de continuacion sobre el checkpoint base y una evaluacion del adaptador mediante su API de decision estructurada.

La rama del adaptador requiere Unsloth, que no estaba instalado en el entorno de prueba segun la propia model card; en su ausencia, el script registra esa limitacion y ejecuta unicamente el control de continuacion con el checkpoint base. No se proporcionan datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF o DPO, porque el objeto del repositorio no es el entrenamiento sino la replicabilidad de la carga y de una generacion controlada.

## Capacidades

- Carga y verificacion de checkpoints: comprueba que el checkpoint base se instancia como `LlamaForCausalLM` y mide el numero de parametros efectivos (134.515.008).
- Generacion de texto controlada: ejecuta un control de generacion greedy con semilla fija (21) sobre tres ejemplos, con continuaciones cortas como salida.
- Registro estructurado de resultados: vuelca las salidas y las limitaciones del experimento en `results.json`.
- Trazabilidad de dependencias: detecta y documenta la ausencia de Unsloth, de modo que la rama del adaptador no se ejecuta y no se emiten conclusiones sobre ella.
- No verificado en este repositorio: tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio, modo thinking y capacidades multilingues.

## Casos de uso

- Auditoria de reproducibilidad de fine-tunes: antes de adoptar un adaptador publicado, se replica este patron para confirmar que el checkpoint base declarado carga correctamente y que el recuento de parametros coincide con el anunciado.
- Verificacion previa a produccion: comprobar que un checkpoint de 135M se instancia con la clase esperada evita errores de integracion en servidores de inferencia como vLLM o TGI, donde una clase incorrecta provoca fallos de carga.
- Control de regresion en CI: el script puede integrarse como paso de integracion continua para detectar cambios inesperados en el repositorio del modelo base (renombrado de ficheros, cambio de configuracion, variacion del recuento de parametros).
- Due diligence de fichas de modelo: cuando una model card afirma una base concreta, este tipo de sonda permite contrastar la afirmacion con evidencia medible en lugar de darla por valida.
- Formacion y divulgacion tecnica: sirve como ejemplo minimo y legible de como estructurar un experimento reproducible con semilla fija y registro de limitaciones, incluida la documentacion honesta de dependencias ausentes.
- Evaluacion de modelos pequenos en entornos con recursos limitados: la base auditada, de 134,5 millones de parametros, es candidata a prototipado en CPU y en dispositivos de borde, aunque este repositorio no aporta mediciones de latencia ni de calidad para ese escenario.
- Analisis de cadenas de dependencias de entrenamiento: dado que la rama del adaptador requiere Unsloth, el repositorio ilustra como registrar el impacto de una dependencia no instalada sobre el alcance real de los resultados obtenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita que el repositorio "no es un benchmark ni una reclamacion de calidad". El unico resultado reportado es un control de generacion greedy con semilla 21 sobre tres ejemplos, cuyas salidas no se reproducen en la informacion proporcionada y que, segun el autor, se limitan a continuaciones cortas.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. Como referencia derivada del recuento medido (134.515.008 parametros), el peso en precision completa de 32 bits ocuparia aproximadamente 538 MB y en FP16 unos 269 MB, cifras que no incluyen cache KV ni activaciones y que no han sido verificadas por el autor.
- GPU recomendadas: no disponible. Por tamano, un modelo de este orden puede ejecutarse en cualquier GPU consumer con al menos 2 GB de memoria libre, asi como en CPU.
- Cabe en GPU consumer: previsiblemente si, dada la magnitud del checkpoint, aunque no hay mediciones publicadas en este repositorio.
- Opciones de despliegue: no disponible. La model card solo menciona la ejecucion del script `smol_d1_comparison.py` en Python y la dependencia de Unsloth para la rama del adaptador. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| Compactbot/smol-d1-spot-check | no es un modelo; audita un checkpoint de 134.515.008 parametros | no disponible | no disponible | Sonda de reproducibilidad |
| FlameF0X/smol-d1 | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo auditado, con adaptador de API de decision estructurada |
| HuggingFaceTB/SmolLM2-135M | no disponible en la informacion proporcionada (citado como base declarada) | no disponible | no disponible | Checkpoint base declarado del modelo auditado |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo utilizable: el repositorio no publica pesos ni pipeline de inferencia, solo un script de verificacion y un fichero de resultados.
- Ausencia total de resultados de calidad: el autor declara explicitamente que no se emite ninguna afirmacion de precision ni comparacion sobre el adaptador, porque Unsloth no estaba instalado en el entorno de prueba.
- Cobertura experimental minima: el control de generacion se limita a tres ejemplos con semilla fija 21, insuficiente para extraer cualquier conclusion sobre comportamiento general.
- Sesgos conocidos: no disponible. No se han realizado evaluaciones de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en este repositorio; aplica el riesgo inherente del checkpoint base, no medido aqui.
- Limitaciones de contexto e idioma: no disponibles, no se documentan pruebas multilingues ni de ventana de contexto.
- Restricciones de licencia: la licencia del repositorio figura como no disponible, por lo que no puede asumirse ningun permiso de uso comercial sobre el propio repositorio ni, por extension, sobre los artefactos que audita.
- Dependencias fragiles: la rama del adaptador depende de Unsloth; sin esa libreria, la verificacion queda incompleta y asi queda registrado.
- Fechas del repositorio: creado el 2026-10-13 y actualizado el mismo dia, con cero descargas y cero likes, lo que apunta a un artefacto de uso personal sin validacion por terceros.
- Uso en produccion: no recomendado como componente de un sistema; su valor es de auditoria y de referencia metodologica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Compactbot/smol-d1-spot-check
- Modelo auditado (FlameF0X/smol-d1): https://huggingface.co/FlameF0X/smol-d1
- Checkpoint base declarado (HuggingFaceTB/SmolLM2-135M): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dependencia mencionada para la rama del adaptador (Unsloth): https://github.com/unslothai/unsloth
- Ficheros citados en la model card, dentro del repositorio: `smol_d1_comparison.py` y `results.json`
- Resultados de busqueda web: las entradas devueltas (nebulaproxy.io y su politica de privacidad) no guardan relacion con el modelo ni con el repositorio, por lo que se descartan como fuentes.
