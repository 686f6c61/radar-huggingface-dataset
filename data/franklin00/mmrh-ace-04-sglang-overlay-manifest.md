# FrankLin00/mmrh-ace-04-sglang-overlay-manifest

## Resumen

`FrankLin00/mmrh-ace-04-sglang-overlay-manifest` no es un modelo de lenguaje: es un artefacto de investigación en seguridad etiquetado explícitamente como `security-research` y `not-for-production`. Se trata de un espécimen inerte ("inert scanner specimen") diseñado para reproducir y documentar un hallazgo de seguridad relacionado con la ruta `overlay custom_materializer` (denominada ACE) en el ecosistema de SGLang. Su propósito es académico: servir como carga de prueba controlada para validar detectores y escáneres de artefactos en Hugging Face.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni datos de entrenamiento. La model card describe un comportamiento de sonda activa que, según el autor, ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red. Las cargas útiles de los especímenes AFW usan el literal inerte `PWNED-INERT`.

Por tanto, esta ficha no puede describir capacidades de inferencia, rendimiento o requisitos de hardware en el sentido habitual. Se documenta el artefacto tal como existe, con las advertencias de seguridad correspondientes y la recomendación de no desplegarlo en ningún entorno productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; artefacto de investigación en seguridad) |
| Parametros totales | no disponible (no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de manifiesto y especímenes; no se declaran safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un transformer, MoE, SSM ni arquitectura híbrida alguna, ni ha sido entrenado con datos. Su estructura interna, según la model card, consiste en un manifiesto de superposición (`overlay manifest`) que preserva el "portador de metadatos del modelo" del hallazgo: una ruta `custom_materializer` (ACE). El autor indica que el manifiesto a nivel de colección (`MANIFEST.json`) contiene los hashes y la ruta del hallazgo original.

La model card menciona además que, cuando la primitiva vulnerable fuerza un contenedor o sufijo (por ejemplo NumPy `.npy`, un checkpoint o `.jinja`), el manifiesto registra esa restricción de formato en lugar de afirmar control de bytes en crudo. No se documentan procesos de RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Comportamiento declarado del espécimen: sonda activa que ejecuta `whoami` en forma argv y escribe la salida en la variable de entorno `HFSCAN_SGLANG__03_OVERLAY_MANIFEST_UNFLAGGED_ACE` bajo `/tmp` o `$TMPDIR`.
- Carga útil inerte de referencia: el literal `PWNED-INERT` en los especímenes AFW.

## Casos de uso

- Validación de escáneres de seguridad: usar el artefacto como muestra de prueba para comprobar que un escáner de Hugging Face detecta la ruta `custom_materializer` (ACE) en manifiestos de superposición.
- Investigación académica sobre cadenas de suministro de modelos: reproducir el hallazgo documentado en `MANIFEST.json` para estudiar cómo se transportan metadatos maliciosos en repositorios de modelos.
- Desarrollo de reglas de detección: alimentar pipelines de análisis estático con este espécimen para calibrar firmas que identifiquen overlays no declarados.
- Pruebas de aislamiento en sandboxes: verificar que un entorno de ejecución confinado bloquea la escritura en `/tmp` o `$TMPDIR` y la ejecución de `whoami` por parte de cargas de modelos.
- Formación y concienciación: emplear el repositorio como ejemplo didáctico de artefacto "no para producción" en talleres sobre seguridad de modelos open source.
- Auditoría de políticas de moderación: comprobar si las políticas de la plataforma marcan correctamente repositorios con las etiquetas `security-research` y `not-for-production`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no ejecuta inferencia y no tiene métricas de rendimiento asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto no es desplegable como modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `FrankLin00/mmrh-ace-04-sglang-overlay-manifest` | Espécimen de investigación en seguridad | no disponible (sin pesos) | no disponible | no disponible | Solo investigación académica; no producción |
| Modelos de lenguaje open source convencionales | LLM con pesos | variable | variable | variable | Inferencia general |
| Repositorios de pruebas de seguridad de la cadena de suministro | Artefactos de test | no disponible | no disponible | variable | Validación de escáneres |

No se dispone de información sobre artefactos comparables específicos dentro de la misma colección `mmrh-ace`.

## Limitaciones y advertencias

- Etiquetado explícitamente como `not-for-production`: no debe desplegarse en ningún entorno real.
- No es un modelo de lenguaje; intentar cargarlo con frameworks de inferencia fallará o producirá resultados indefinidos.
- El autor declara que la sonda ejecuta `whoami` y escribe en `/tmp` o `$TMPDIR`; aunque se describe como inerte, cualquier ejecución de código derivada de artefactos de modelos debe tratarse con desconfianza y en sandbox.
- Riesgo de malinterpretación: la presencia de la etiqueta `security-research` no garantiza que el contenido sea seguro en todos los contextos; aplicar análisis estático propio.
- Licencia no declarada: no hay permiso explícito de uso comercial ni de redistribución.
- Idiomas no declarados.
- Posible confusión con un modelo real por parte de herramientas automáticas que indexan repositorios de Hugging Face sin filtrar por tipo de artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-ace-04-sglang-overlay-manifest
- Manifiesto de colección (`MANIFEST.json`): referenciado en la model card, no se proporciona URL directa en la información disponible.
- Paper, blog o repositorio del hallazgo original: no disponible en la información proporcionada.
