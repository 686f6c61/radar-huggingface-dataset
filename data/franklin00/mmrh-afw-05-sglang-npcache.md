# FrankLin00/mmrh-afw-05-sglang-npcache

## Resumen

`FrankLin00/mmrh-afw-05-sglang-npcache` es un artefacto de investigación en seguridad publicado en Hugging Face, no un modelo de lenguaje funcional. Su model card lo describe explícitamente como un "espécimen de escáner inerte" (inert scanner specimen) para investigación académica, etiquetado con `security-research` y `not-for-production`. El repositorio tiene un tamaño de 0.0 GB y cero descargas, lo que confirma que no contiene pesos de modelo utilizables.

El artefacto preserva el "portador de metadatos del modelo" asociado a un hallazgo de seguridad: una clave de `state_dict` de checkpoint (denominada AFW en la nomenclatura del autor). Según la model card, cualquier sonda activa ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red. El payload inerte literal es `PWNED-INERT`.

Su relevancia es exclusivamente metodológica: sirve como muestra reproducible para estudiar vectores de ataque basados en nombres de tensores y cachés en el stack SGLang, y para validar herramientas de escaneo de artefactos en Hugging Face. No debe emplearse en producción ni como base para ninguna aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; artefacto de investigación en seguridad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.0 GB; portador descrito como clave de `state_dict` de checkpoint) |

## Arquitectura y entrenamiento

No aplica: el artefacto no es un transformer, MoE ni SSM, y no ha sido entrenado. Se trata de un espécimen inerte que preserva un carrier de metadatos (una clave de `state_dict`) asociado a un hallazgo de seguridad en el ecosistema SGLang, concretamente a un vector de traversal en nombres de tensores y caché NPC.

La model card indica que las sondas activas, si se ejecutan, se limitan a invocar `whoami` en forma de argv y a volcar la salida en la variable `HFSCAN_SGLANG__05_NPCACHE_TENSOR_NAME_TRAVERSAL_AFW` bajo `/tmp` o `$TMPDIR`. Cuando el primitivo vulnerable fuerza un contenedor o sufijo (por ejemplo `.npy`, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de afirmar control de bytes en crudo. No hay datos de entrenamiento, RLHF ni DPO.

## Capacidades

- No genera texto, código ni realiza razonamiento: es un artefacto inerte.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su función es servir como muestra reproducible para validar escáneres de seguridad en artefactos de Hugging Face.
- Preserva metadatos de un hallazgo (clave de `state_dict`) para análisis académico.

## Casos de uso

- Investigación académica en seguridad: usar el espécimen como caso de prueba controlado para estudiar vectores de traversal en nombres de tensores dentro de SGLang, sin ejecutar cargas dañinas.
- Validación de escáneres de artefactos: alimentar herramientas de análisis de repositorios Hugging Face para comprobar que detectan carriers de metadatos sospechosos en `state_dict`.
- Reproducibilidad de hallazgos: el `MANIFEST.json` de la colección permite verificar hashes y la ruta del hallazgo original en auditorías.
- Formación en seguridad de la cadena de suministro de ML: emplear el artefacto como ejemplo didáctico de por qué no deben cargarse checkpoints de origen desconocido.
- Pruebas de políticas de admisión: verificar que los pipelines de CI rechazan artefactos etiquetados `not-for-production`.
- Estudio de restricciones de formato: analizar cómo los sufijos forzados (`.npy`, `.jinja`) limitan el control de bytes en primitivas vulnerables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el repositorio ocupa 0.0 GB y no contiene pesos.
- GPU recomendadas: no aplica.
- No cabe ni es ejecutable en GPU consumer: no hay modelo que cargar.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no pueden servir este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| FrankLin00/mmrh-afw-05-sglang-npcache | Espécimen de seguridad inerte | no disponible | no disponible | no disponible | Investigación, no producción |
| Modelos de la misma colección `mmrh-*` del autor | Especímenes de seguridad | no disponible | no disponible | no disponible | Investigación, no producción |
| Modelos LLM convencionales en Hugging Face | Modelos de lenguaje | variable | variable | variable | Inferencia en producción |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con modelos de lenguaje; la comparación solo es posible a nivel de naturaleza del artefacto.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos ni tokenizador, y el repositorio está vacío (0.0 GB).
- Etiquetado explícitamente `not-for-production`; su uso en entornos productivos está desaconsejado por el propio autor.
- Riesgo de confusión: un pipeline que cargue automáticamente repositorios de Hugging Face podría tratar este artefacto como un modelo y fallar o comportarse de forma inesperada.
- Sin licencia declarada: no hay permisos explícitos de uso comercial ni de redistribución.
- Sin idiomas ni sesgos evaluables, al no existir comportamiento generativo.
- Cualquier sonda asociada debe tratarse con cautela: aunque la model card describe ejecución limitada a `whoami`, conviene aislarla en sandbox y revisar el `MANIFEST.json` antes de manipularla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-05-sglang-npcache
- Colección y `MANIFEST.json` del autor: no disponible como URL directa en la información proporcionada
- Paper, blog o repositorio del hallazgo original: no disponible en la información proporcionada
