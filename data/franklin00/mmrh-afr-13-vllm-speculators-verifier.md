# FrankLin00/mmrh-afr-13-vllm-speculators-verifier

## Resumen

`FrankLin00/mmrh-afr-13-vllm-speculators-verifier` es un artefacto de investigación en seguridad, no un modelo de lenguaje entrenado. Se presenta como un "espécimen de escáner inerte" (*inert scanner specimen*) diseñado para reproducir de forma controlada un hallazgo de seguridad relacionado con el cargador de pesos de vLLM, concretamente con el campo `name_or_path` del verificador de especuladores. Su propósito es académico: permitir a investigadores reproducir y analizar la primitiva vulnerable sin ejecutar código malicioso real.

El repositorio contiene únicamente ficheros `safetensors` con un total declarado de 4 parámetros y un tamaño de 0,0 GB, lo que confirma que no aloja pesos de un modelo funcional. Las etiquetas del autor (`security-research`, `not-for-production`) y el aviso explícito de la model card ("It must not be used in production") delimitan su alcance: sirve como material de referencia para auditorías de cadena de suministro en plataformas de inferencia.

Su relevancia es acotada pero específica: ejemplifica un patrón de ataque de tipo *cross-API redirect* en el que metadatos de un modelo (en este caso, la ruta del verificador de decodificación especulativa) pueden inducir comportamiento no previsto en el servidor de inferencia. No debe confundirse con un modelo desplegable ni evaluarse con benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de investigación, no es un modelo entrenado) |
| Parametros totales | 4 (según safetensors; no corresponde a un modelo funcional) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un contenedor de metadatos que preserva el "portador" (*carrier*) del hallazgo: el campo `name_or_path` asociado al verificador de especuladores en vLLM. Según la model card, cualquier sonda activa incluida ejecuta únicamente `whoami` en forma de argv (nunca `shell=True`) y escribe su salida en la variable de entorno `HFSCAN_VLLM__03_SPECULATORS_VERIFIER_REDIRECT_CROSS_API_AFR`, bajo `/tmp` o `$TMPDIR`.

La model card indica que el espécimen no realiza acceso a credenciales ni operaciones de red. Los especímenes de tipo AFW emplean el payload inerte literal `PWNED-INERT`, y cuando la primitiva vulnerable fuerza un contenedor o sufijo concreto (por ejemplo `.npy`, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de afirmar control de bytes en crudo. Los hashes y la ruta del hallazgo original se documentan en dicho manifiesto a nivel de colección.

## Capacidades

- No genera texto, código, matemáticas ni razonamiento: carece de pesos funcionales.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su función es servir como carga útil inerte para reproducir un hallazgo de seguridad en el cargador de modelos de vLLM.
- Permite verificar el comportamiento del escáner (`HFSCAN`) frente a un portador de metadatos malicioso simulado.
- Documenta la restricción de formato cuando la primitiva vulnerable impone un contenedor específico.

## Casos de uso

- Reproducción de hallazgos en auditorías de vLLM: el investigador carga el artefacto en un entorno aislado para confirmar que la ruta del verificador de especuladores se interpreta según lo descrito en el informe original, sin ejecutar código dañino.
- Validación de escáneres de cadena de suministro: sirve como caso de prueba negativo/positivo para comprobar que herramientas de análisis detectan el portador de metadatos y no lo confunden con un modelo legítimo.
- Formación en seguridad de plataformas de inferencia: útil en talleres para ilustrar cómo metadatos aparentemente inocuos (`name_or_path`) pueden constituir un vector de ataque *cross-API*.
- Pruebas de políticas de admisión de modelos: permite verificar que un registro interno o *gateway* rechaza artefactos etiquetados como `not-for-production` antes de llegar a producción.
- Desarrollo de reglas de detección: los hashes del `MANIFEST.json` de la colección permiten construir firmas y comparar contra repositorios sospechosos.
- Investigación de decodificación especulativa: contexto para estudiar cómo el verificador de especuladores resuelve rutas y qué validaciones debería aplicar el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es evaluable con métricas de calidad de modelo (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada: insignificante; el repositorio ocupa 0,0 GB y contiene 4 parámetros declarados.
- GPU recomendadas: no aplica; no requiere acelerador para su función documental.
- Cabe en cualquier GPU consumer, e incluso en CPU, siempre que se use en un entorno aislado.
- Opciones de despliegue: no debe desplegarse con vLLM, llama.cpp, Ollama ni TGI en producción. Su uso previsto es el análisis estático y la reproducción controlada en sandbox.
- Latencia y throughput: no disponibles y sin sentido para este artefacto.

## Comparativa con modelos similares

| Artefacto | Naturaleza | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `FrankLin00/mmrh-afr-13-vllm-speculators-verifier` | Espécimen de investigación en seguridad | 4 (declarados) | no disponible | no disponible | Solo investigación, no producción |
| Modelo LLM desplegable (categoría general) | Red neuronal entrenada | Miles de millones | Miles de tokens | Variable | Inferencia en producción |
| Modelo de especuladores/verificador de vLLM | Componente de decodificación especulativa | no disponible | no disponible | no disponible | Aceleración de inferencia |

No se identifican en la información proporcionada otros artefactos de la misma colección ni modelos comparables de la misma categoría (especímenes de seguridad). La comparación con LLM convencionales no es significativa porque las dimensiones evaluadas (calidad, contexto, rendimiento) no aplican.

## Limitaciones y advertencias

- No es un modelo utilizable: no genera texto ni ejecuta tareas de inferencia.
- Etiquetado explícitamente como `not-for-production`; su despliegue en entornos reales está contraindicado.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni de redistribución.
- Riesgo de confusión en pipelines automáticos que indexen repositorios de HuggingFace sin filtrar por etiquetas de seguridad.
- La model card advierte de que preserva un portador de metadatos asociado a una primitiva vulnerable; cargarlo con herramientas que resuelvan `name_or_path` sin validación podría reproducir el comportamiento no deseado.
- No se documentan sesgos ni alucinaciones porque no hay modelo lingüístico, pero sí existe riesgo de interpretación errónea del artefacto como modelo real.
- Los datos de la model card son material de referencia del autor y no deben tratarse como instrucciones operativas.
- Fecha de creación declarada (2026-11-02) y métricas de comunidad nulas (0 descargas, 0 likes): sin validación externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-afr-13-vllm-speculators-verifier
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales. El `MANIFEST.json` de la colección se menciona en la model card pero no se incluye su URL.
