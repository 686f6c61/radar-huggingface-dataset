# LayerFault/script-js-computed-require

## Resumen

`LayerFault/script-js-computed-require` es un artefacto sintético de pruebas de seguridad perteneciente al corpus Layerfault, identificado con el código `LF-CH-SCRX-0004`. No es un modelo de IA utilizable: se trata de una pieza construida deliberadamente con características adversariales (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt-injection) diseñadas para ejercitar las reglas de detección de escáneres de seguridad. El autor, LayerFault, desarrolla una herramienta CLI de admisión y control de seguridad offline-first para modelos de IA locales, que valida la estructura del paquete, la integridad, la procedencia y el cumplimiento de políticas antes de permitir su ejecución.

La relevancia de este artefacto radica en su función dentro del ecosistema de seguridad de modelos: permite verificar que los sistemas de detección identifican correctamente paquetes maliciosos o sospechosos. La model card advierte explícitamente que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner. No existe arquitectura, tamaño de parámetros ni datos de entrenamiento porque no es un modelo de aprendizaje automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible (no es un modelo ML) |
| Parametros activos | no disponible (no es un modelo ML) |
| Longitud de contexto | no disponible (no es un modelo ML) |
| Tipos de cuantizacion | no disponible (no es un modelo ML) |
| Idiomas soportados | no disponible (no es un modelo ML) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo de aprendizaje automático ni pesos entrenados. Segun la model card, es un artefacto sintetico del corpus Layerfault de seguridad, disenado como entrada de control positiva para pruebas de escaner. Incluye caracteristicas adversariales intencionadas —como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de prompt injection— que no provienen de ningun proceso de entrenamiento, sino de construccion manual para pruebas de deteccion. La herramienta Layerfault (CLI de admision offline-first) usa este tipo de artefactos para validar que sus reglas de deteccion se activan correctamente antes de admitir un paquete de modelo en un entorno local.

## Capacidades

- No es un modelo generativo ni de razonamiento; no produce texto, codigo ni respuestas.
- Funciona exclusivamente como fixture de prueba para escaneros de seguridad estaticos.
- Contiene caracteristicas adversariales (opcodes de pickle sospechosos, contrabando de formato ejecutable, strings de prompt injection) para ejercitar reglas de deteccion.
- La regla candidata objetivo es `LF-JS-SEMANTIC-PROCESS`, que se espera que el escanero detecte y bloquee.
- Clasificacion del desafio: severidad **alta**, dificultad **compuesta**, decision de admision esperada **BLOCK**, control de tipo **positivo**, superficie de ataque **script-supply-chain**.

## Casos de uso

- **Validacion de detectores de seguridad**: el artefacto se usa como entrada positiva para comprobar que un escanero (como Layerfault) detecta correctamente paquetes de modelo con caracteristicas sospechosas. Se coloca en un pipeline de CI/CD de seguridad para verificar que las reglas de deteccion se activan.
- **Pruebas de regresion en herramientas de admission**: los equipos que mantienen sistemas de admision de modelos locales pueden incorporar este artefacto en su suite de pruebas para asegurar que cambios futuros no rompan la deteccion de paquetes maliciosos.
- **Evaluacion de cobertura de reglas**: los desarrolladores de scanners pueden usar este y otros artefactos del corpus Layerfault para identificar puntos ciegos en sus detectores, ya que el desafio puede estar intencionalmente sin mapear hasta que se implemente la regla correspondiente.
- **Entrenamiento de clasificadores de seguridad**: aunque no es un modelo ML, el contenido de este artefacto puede servir como dato de entrenamiento para sistemas de deteccion de paquetes maliciosos en el ecosistema de modelos locales.
- **Documentacion de politicas de admision**: permite demostrar en entornos de auditoria que la politica de admision de una organizacion bloquea paquetes con caracteristicas adversariales antes de su carga.
- **Investigacion en seguridad de la cadena de suministro**: como muestra representativa de tecnicas de ataque (computed require en JavaScript), puede usarse en estudios academicos o informes tecnicos sobre vectores de ataque en la cadena de suministro de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no es un modelo de IA y no tiene metricas de rendimiento en tareas de lenguaje, vision o razonamiento.

## Requisitos de hardware

- No se requieren GPUs ni hardware de inferencia: no es un modelo ejecutable.
- El unico entorno necesario es un sandbox aislado de pruebas de escanero de seguridad.
- No se necesita VRAM, ni aceleradores, ni infraestructura de inferencia.
- El despliegue se limita a herramientas de escaneo estatico como la CLI Layerfault, sin latencia de inferencia relevante.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a ninguna categoria de modelos de IA comparable. Existen otros artefactos del corpus Layerfault (identificados por su corpus ID) que cumplen funciones similares de prueba de seguridad, pero no hay modelos de lenguaje u otras arquitecturas comparables en el mismo repositorio.

## Limitaciones y advertencias

- **No es un modelo utilizable**: no se puede cargar en ningun framework de inferencia (vLLM, llama.cpp, Ollama, TGI, etc.) ni ejecutar para ninguna tarea de IA.
- **Contenido adversarial**: incluye opcodes de pickle sospechosos, contrabando de formato ejecutable y strings de prompt injection. Cargarlo o ejecutarlo fuera de un entorno aislado puede activar comportamientos no deseados o comprometer la seguridad del sistema.
- **Riesgo de uso indebido**: si un desarrollador lo confunde con un modelo real y lo integra en un pipeline, podria introducir vulnerabilidades de inyeccion de prompt o ejecucion de codigo.
- **Sin garantias de integridad**: el repositorio no ofrece garantias de que el contenido sea benigno mas alla de la descripcion de la model card; es un artefacto de prueba, no un modelo de produccion.
- **Licencia apache-2.0**: aunque la licencia permite uso comercial, la naturaleza del artefacto lo hace inadecuado para cualquier uso fuera de testing de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/script-js-computed-require
- Herramienta Layerfault en GitHub: https://github.com/izm1chael/layerfault
- Releases de LayerFault: https://github.com/izm1chael/layerfault/releases
