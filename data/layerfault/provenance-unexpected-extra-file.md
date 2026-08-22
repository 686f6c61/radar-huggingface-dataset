# LayerFault/provenance-unexpected-extra-file

## Resumen

Este repositorio, publicado por el usuario LayerFault, es un artefacto sintético de prueba de seguridad perteneciente al corpus LayerFault, diseñado específicamente para ejercitar reglas de detección en escáneres de seguridad de modelos. No es un modelo de aprendizaje automático utilizable: contiene características adversarias deliberadas, como opcodes pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts, con el objetivo de validar herramientas de análisis estático y dinámico. Su identificador de corpus es `LF-CH-PROV-0004` y se clasifica como un desafío de severidad alta, dificultad compuesta y decisión esperada de bloqueo.

El repositorio tiene 16 parámetros totales (según el archivo safetensors incluido) y un tamaño de 0,0 GB, lo que confirma que no contiene pesos de un modelo real. La model card advierte explícitamente que nunca debe cargarse o ejecutarse fuera de un entorno aislado de pruebas de escáneres. Su relevancia radica en la creciente necesidad de herramientas como LayerFault (una CLI local de admisión y validación de modelos) que detecten artefactos maliciosos o manipulados antes de su despliegue en entornos de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de prueba, no un modelo) |
| Parametros totales | 16 (según metadatos safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (archivo de 16 bytes) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal ni un proceso de entrenamiento real. El repositorio es un artefacto sintético generado para pruebas de seguridad, con un único archivo safetensors de 16 bytes que probablemente contiene metadatos mínimos o un marcador de control. El corpus LayerFault se construye con "secretos falsos, destinos de red loopback/.invalid, salida de marcador inofensiva y comportamiento de modelo sintético", según la model card. No se ha aplicado RLHF, DPO ni ninguna técnica de entrenamiento de modelos de lenguaje. La innovación técnica relevante es su diseño para evaluar la integridad de procedencia y la detección de archivos extra inesperados en repositorios de modelos.

## Capacidades

- No es un modelo generativo ni de razonamiento: no tiene capacidades de texto, código, visión o audio.
- Actúa como un vector de prueba para escáneres de seguridad, validando reglas de detección de archivos inesperados en repositorios de modelos.
- Puede contener payloads de inyección de prompts o contrabando de ejecutables, diseñados para activar alertas en herramientas de análisis estático.
- No soporta tool calling, agentes ni razonamiento multilingüe.
- Su única "capacidad" es servir como entrada negativa o positiva en pipelines de admisión de modelos (LayerFault, scanners de HuggingFace, etc.).

## Casos de uso

- **Pruebas de escáneres de seguridad de repositorios de modelos**: se utiliza para verificar que una herramienta de validación (como LayerFault) detecta y bloquea artefactos con características adversóticas antes de que se carguen en un entorno de producción.
- **Evaluación de integridad de procedencia**: permite comprobar si un sistema de admisión detecta archivos extra no declarados en la estructura del repositorio (un ataque de superficie de procedencia).
- **Entrenamiento de detectores de amenazas**: los equipos de seguridad pueden usar este artefacto para entrenar modelos de detección de anomalías en repositorios de HuggingFace, comparando su comportamiento con archivos legítimos.
- **Test de aislamiento de entornos**: sirve para verificar que un entorno de ejecución de IA está correctamente aislado, ya que el artefacto no debe ejecutarse nunca en un entorno real.
- **Auditoría de políticas de licencia**: permite comprobar que una herramienta de gobernanza respeta la licencia apache-2.0 incluso en artefactos no funcionales.
- **Investigación en seguridad de la cadena de suministro**: se puede emplear como ejemplo en estudios sobre ataques a la cadena de suministro de IA (como el ataque a LiteLLM), para ilustrar cómo los artefactos maliciosos pueden colarse en repositorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no tiene rendimiento evaluable, ya que no es un modelo ejecutable.

## Requisitos de hardware

- No aplica: el archivo safetensors de 16 bytes no requiere hardware de inferencia.
- No es ejecutable; cualquier intento de cargarlo en un runtime de modelos (vLLM, llama.cpp, Ollama, etc.) fallará o producirá un error.
- En un entorno de pruebas de seguridad, se recomienda ejecutar análisis estático (scanner) sin necesidad de GPU.
- Para pruebas dinámicas, debe usarse un sandbox aislado sin acceso a red ni a datos sensibles.

## Comparativa con modelos similares

No existe un modelo comparable, ya que no es un modelo de IA. Puede compararse con otros artefactos del corpus LayerFault (como `LF-CH-PROV-0001`, `LF-CH-PROV-0002`), pero no se dispone de información detallada de esos repositorios. En el ámbito de la seguridad, se puede contrastar con herramientas de validación como LayerFault, pero no hay modelos de referencia.

## Limitaciones y advertencias

- **No es un modelo de IA**: cualquier intento de usarlo como modelo de lenguaje, generación o razonamiento es un error y puede provocar fallos de seguridad.
- **Contiene características adversóticas**: incluye opcodes pickle sospechos, contrabando de formatos ejecutables y cadenas de inyección de prompts, diseñados para evadir o probar defensas.
- **Riesgo de ejecución**: si se carga en un entorno no aislado, podría ejecutar código malicioso (aunque el corpus afirma usar solo secretos falsos y destinos `.invalid`).
- **Restricción de uso**: la model card exige un gate de aceptación explícito; solo debe usarse en entornos de pruebas de escáneres de seguridad.
- **Licencia apache-2.0**: permite uso comercial y modificación, pero el artefacto no tiene utilidad fuera del ámbito de pruebas de seguridad.
- **Sin mantenimiento ni soporte**: el repositorio fue creado en 2026-08-21 y no tiene actividad posterior.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/LayerFault/provenance-unexpected-extra-file)
- [Repositorio de LayerFault en GitHub](https://github.com/izm1chael/layerfault/tree/main)
- [Documentación de fuentes de LayerFault](https://github.com/izm1chael/layerfault/blob/main/docs/SOURCES.md)
- [Artículo sobre pruebas de procedencia de modelos (arXiv)](https://arxiv.org/html/2502.00706v1)
- [Noticia sobre ataque a la cadena de suministro de LiteLLM](https://undercodenews.com/sandclock-supply-chain-attack-how-the-litellm-breach-turned-a-popular-ai-gateway-into-a-credential-stealing-trap/)
- [Informe sobre seguridad de agentes de IA 2026](https://decodethefuture.org/en/ai-agent-security-2026/)
