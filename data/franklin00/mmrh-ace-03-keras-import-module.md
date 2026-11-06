# FrankLin00/mmrh-ace-03-keras-import-module

## Resumen

`FrankLin00/mmrh-ace-03-keras-import-module` es un artefacto de investigación en seguridad publicado en Hugging Face por el usuario FrankLin00. No es un modelo de lenguaje entrenado, sino una "muestra inerte" (*inert scanner specimen*) diseñada para reproducir de forma controlada un hallazgo de seguridad: la capacidad de un fichero `.keras` de cargar módulos arbitrarios a través de su `config.json`. El repositorio lo etiqueta explícitamente como `security-research` y `not-for-production`.

El propósito del artefacto es servir como material de referencia académica para escáneres de seguridad de modelos. Según la model card, cualquier sonda activa ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe su salida en la variable de entorno `HFSCAN_KERAS__02_KERAS_IMPORT_MODULE_ACE` bajo `/tmp` o `$TMPDIR`, sin acceder a credenciales ni realizar operaciones de red. Los especímenes AFW asociados usan el payload inerte literal `PWNED-INERT`.

No se trata, por tanto, de un modelo utilizable para inferencia: no hay parámetros entrenados, ni tokenizador, ni pesos con capacidad generativa. Su relevancia es exclusivamente metodológica, dentro del ámbito de la evaluación de riesgos en la cadena de suministro de modelos (model supply chain security) y del análisis de formatos de serialización como Keras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de seguridad, no es un modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.keras` (fichero de configuracion con `config.json`); manifiesto `MANIFEST.json` a nivel de coleccion |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un espécimen de escaneo que preserva el vector de ataque (*carrier*) del hallazgo: el módulo importado desde `config.json` dentro de un fichero `.keras`. La model card describe el comportamiento de la sonda activa como la ejecución de `whoami` en forma de argv y la escritura del resultado en una variable de entorno concreta, sin acceso a credenciales ni tráfico de red.

La colección incluye un `MANIFEST.json` que registra hashes y la ruta del hallazgo original. Cuando el primitivo vulnerable obliga a un contenedor o sufijo específico (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el manifiesto documenta esa restricción de formato en lugar de afirmar control de bytes en crudo.

## Capacidades

- No genera texto, no razona, no produce código ni resuelve matemáticas: carece de pesos entrenados.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su función es servir como muestra de referencia para validar escáneres de seguridad que detectan importación de módulos en ficheros `.keras`.
- Permite reproducir de forma inerte el vector de ataque documentado, con payload controlado (`PWNED-INERT`) y sin efectos secundarios fuera de `/tmp` o `$TMPDIR`.

## Casos de uso

- Validación de escáneres de seguridad de modelos: se puede usar como caso de prueba positivo para comprobar que una herramienta de análisis estática o dinámica detecta la importación de módulos desde `config.json` en un `.keras`; el espécimen está diseñado precisamente para eso.
- Investigación académica sobre formatos de serialización: permite estudiar cómo el formato `.keras` resuelve referencias a módulos y qué superficie de ataque introduce, sin necesidad de construir un artefacto malicioso real.
- Pruebas de pipelines de cuarentena: un registro de modelos o un proxy de descarga puede verificar que bloquea o aísla este repositorio antes de que llegue a un entorno de ejecución, usando el espécimen como entrada de test.
- Formación en seguridad de la cadena de suministro de ML: sirve como ejemplo didáctico controlado en talleres sobre riesgos de `trust_remote_code` y carga de configuraciones serializadas.
- Desarrollo de reglas de detección (YARA, Semgrep, reglas propias de escáner): el `MANIFEST.json` y la ruta del hallazgo documentada permiten correlacionar firmas y reducir falsos positivos.
- Verificación de aislamiento en sandboxes: al ejecutar la sonda solo `whoami` y escribir en `/tmp` o `$TMPDIR`, se puede comprobar que un entorno de ejecución restringido contiene correctamente el efecto y no permite acceso a credenciales ni red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo entrenado, no aplican métricas de calidad tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni grafo de inferencia que cargar.
- GPU recomendadas: no aplica; el artefacto no requiere aceleración por hardware.
- Ejecución en GPU de consumo: irrelevante; cualquier ejecución se limita a la carga de un fichero de configuración Keras.
- Opciones de despliegue: no procede vLLM, llama.cpp, Ollama ni TGI. El entorno relevante es un sandbox aislado de análisis de artefactos, con sistema de ficheros efímero y sin acceso a red ni a secretos.
- Latencia y throughput: no disponibles y sin sentido para este artefacto.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada otros especímenes de escaneo comparables de este mismo autor o de la misma colección, ni modelos de la misma categoría con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio está etiquetado como `not-for-production`; no debe desplegarse en ningún entorno productivo.
- No es un modelo funcional: no puede usarse para generación, clasificación ni ninguna tarea de ML.
- Aunque el payload declarado es inerte (`whoami`, sin `shell=True`, sin red ni credenciales), se trata de un artefacto de seguridad y debe manipularse en un sandbox aislado, con permisos mínimos y sin secretos accesibles.
- La licencia no está disponible, por lo que no se puede asumir permiso de uso comercial ni de redistribución.
- Los idiomas soportados no están disponibles y, en la práctica, no aplican.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-02 con apenas unos segundos de diferencia; no hay evidencia de mantenimiento ni de validación por terceros.
- La model card no documenta hashes directamente: remite al `MANIFEST.json` de la colección, que no se incluye en la información proporcionada; conviene verificarlo antes de cualquier uso.
- Existe riesgo de que herramientas automáticas confundan este repositorio con un modelo real; debe excluirse explícitamente de índices y catálogos de modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-ace-03-keras-import-module
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
