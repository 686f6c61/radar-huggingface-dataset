# DAIRLab/phystwin_models

## Resumen

PhysTwin fitted models es un repositorio de pesos y artefactos de entrenamiento publicado por DAIRLab en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo en el sentido habitual, sino de un conjunto de ajustes (fits) de tipo PhysTwin con arquitectura de muelle-masa (spring-mass) producidos a partir de las sesiones de laboratorio del dataset DAIRLab/phystwin_dataset. Cada carpeta corresponde a una sesión grabada y a una ejecución de ajuste concreta, e incluye todos los checkpoints guardados.

El repositorio se apoya en el método PhysTwin (repositorio Jianghanxiao/PhysTwin, licencia MIT), que reconstruye y modela dinámicas físicas de objetos deformables mediante sistemas de masas y muelles ajustados a observaciones. El tamaño del repositorio es de 57,9 GB, lo que refleja la acumulación de checkpoints nativos, registros de ejecución y metadatos por cada sesión. La licencia MIT se aplica únicamente a los paquetes de ajuste producidos por el proyecto, no a las grabaciones del dataset enlazado, que no declaran licencia.

La relevancia de este repositorio es acotada: sirve como material de referencia y reproducibilidad para investigación en simulación física y ajuste de modelos deformables, no como un modelo listo para inferencia de propósito general. La propia model card advierte que ningún modelo fue cargado, renderizado, reanudado ni reevaluado para la publicación de la ficha, y que el uso en destino limpio es un paso de validación separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PhysTwin: sistema de muelle-masa (spring-mass) ajustado a datos; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a este tipo de modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT para los paquetes de ajuste del proyecto; el dataset enlazado no declara licencia |
| Formato de pesos | checkpoints nativos y ficheros de estado (native/), registros de ejecucion y metadatos; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del método PhysTwin: un sistema de masas y muelles cuyos parametros (rigideces, posiciones, topologia, etc.) se ajustan para reproducir el comportamiento observado en grabaciones de laboratorio. Los ajustes se realizan mediante optimizacion, no mediante entrenamiento de redes neuronales. En la ejecucion documentada se emplean dos etapas: CMA (optimizacion evolutiva, con 250 generaciones completadas de 2750 solicitudes emitidas) y Adam (500 recorridos completados y 245 500 actualizaciones completadas de 245 500 configuradas).

El paquete de cada ejecucion incluye checkpoints nativos byte a byte, registros y logs (generaciones CMA, candidatos y estado de estrategia; snapshots de Adam, estado de continuacion y perdidas por actualizacion), evidencias de lanzamiento y seleccion de padre, y un fichero run.json que documenta etapas, objetivos reales, parametros optimizados y fijos, presupuestos configurados frente a completados, etiquetas con sus condiciones de puntuacion, revisiones de codigo y estado sucio, capacidades e incognitas. Cada valor del run.json referencia el registro nativo del que procede.

## Capacidades

- Ajuste de dinamicas fisicas de objetos deformables mediante modelos de muelle-masa, siguiendo el metodo PhysTwin.
- Produccion de checkpoints intermedios y finales por ejecucion, con trazabilidad completa de etapas CMA y Adam.
- Registro de evidencia de seleccion de padre, lanzamiento y cualificacion de cada ejecucion.
- Documentacion de presupuestos completados frente a configurados y de las condiciones de puntuacion de las etiquetas BEST y FINAL.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues, por no tratarse de un modelo de lenguaje.
- No se documenta modo thinking, audio ni ninguna capacidad generativa.

## Casos de uso

- Reproducibilidad de experimentos de simulacion fisica: el paquete permite inspeccionar checkpoints y registros de cada etapa (CMA y Adam) para verificar resultados de ajuste en un entorno controlado.
- Investigacion en modelado de objetos deformables: los fits de sesiones de laboratorio sirven como referencia para comparar metodos de ajuste de sistemas muelle-masa.
- Auditoria de procesos de optimizacion: run.json y checkpoints.tsv permiten reconstruir presupuestos, objetivos y etiquetas de cada ejecucion con trazabilidad al registro nativo.
- Desarrollo de pipelines de validacion en destino limpio: el repositorio esta pensado para un paso posterior de validacion (plan PR4) antes de reutilizar los modelos.
- Docencia y formacion en fisica computacional: las sesiones de laboratorio ajustadas pueden usarse como material didactico para estudiar el metodo PhysTwin.
- Base para extensiones del metodo PhysTwin: los checkpoints nativos permiten partir de estados guardados para experimentos derivados, siempre que se respete la identidad de ejecucion registrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se documentan requisitos de GPU ni de memoria para cargar los checkpoints.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no disponible.
- Nota: el repositorio ocupa 57,9 GB, por lo que se requiere espacio en disco suficiente para alojar todos los checkpoints y registros.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAIRLab/phystwin_models | Fits PhysTwin (muelle-masa) | no disponible | no aplica | MIT (paquetes de ajuste) | Hugging Face |
| Jianghanxiao/PhysTwin | Metodo/codigo de referencia | no aplica | no aplica | MIT | Repositorio de codigo |
| DAIRLab/phystwin_dataset | Dataset de sesiones de laboratorio | no aplica | no aplica | no declarada | Hugging Face |

No se dispone de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Ningun modelo del repositorio fue cargado, renderizado, reanudado ni reevaluado para la model card; el uso en destino limpio es un paso de validacion separado (plan PR4).
- BEST y FINAL son las etiquetas que los ajustes registraron bajo sus condiciones de puntuacion declaradas; el empaquetado no selecciona ningun modelo preferido.
- La recuperacion de ejecuciones interrumpidas esta cualificada por la identidad de ejecucion y las entradas registradas; extender el horizonte de una ejecucion completada y la reproduccion completa no estan soportadas ni se reclaman.
- Las ejecuciones historicas con rigidez aplicada en el uso (clamp-at-use) no se reinterpretan como ejecuciones con actualizacion proyectada.
- La licencia MIT no relicencia las grabaciones del dataset DAIRLab/phystwin_dataset, que no declaran licencia, ni codigo o datos de terceros.
- No es un modelo de lenguaje: no procede evaluar sesgos linguisticos, alucinacion textual ni limitaciones de contexto o idioma.
- No se documentan riesgos de sesgo ni restricciones adicionales para uso comercial mas alla de las condiciones de la licencia MIT y de la atribucion al metodo PhysTwin.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DAIRLab/phystwin_models
- Dataset enlazado: https://huggingface.co/datasets/DAIRLab/phystwin_dataset
- Metodo PhysTwin (codigo de referencia): https://github.com/Jianghanxiao/PhysTwin
