# FrankLin00/mmrh-afw-13-vllm-terratorch

## Resumen

`FrankLin00/mmrh-afw-13-vllm-terratorch` es un artefacto de investigación en seguridad publicado en HuggingFace, no un modelo de lenguaje funcional. Su model card lo describe explícitamente como un "inert scanner specimen" (espécimen inerte para escáneres) destinado a investigación académica sobre seguridad, y advierte de que no debe usarse en producción. El repositorio conserva el "model-metadata carrier" de un hallazgo de seguridad concreto: la clave de configuración `terratorch backbone_cache_dir` bajo la categoría AFW.

El artefacto está etiquetado con `timm_wrapper` y `safetensors`, y el recuento de parámetros en safetensors es de 4, lo que confirma que no contiene pesos de un modelo real. No dispone de pipeline, licencia, idiomas ni documentación técnica de arquitectura. El tamaño del repositorio es de 0.0 GB.

Su relevancia es exclusivamente metodológica: sirve como muestra de referencia para validar escáneres de seguridad que detectan cargas útiles inertes en metadatos de modelos. Cualquier evaluación como modelo de IA (capacidades, benchmarks, despliegue) carece de sentido con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de seguridad, no modelo) |
| Parametros totales | 4 (según safetensors) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (wrapper `timm_wrapper`) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO). El artefacto se describe como un "inert scanner specimen" que preserva el vector de metadatos de un hallazgo de seguridad: la configuración `terratorch backbone_cache_dir` (AFW). Según la model card, cualquier sonda activa ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe su salida en la variable `HFSCAN_VLLM__04_TERRATORCH_PRETRAINED_CFG_AFW` bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

La carga útil inerte es la cadena literal `PWNED-INERT`. Cuando la primitiva vulnerable impone un contenedor o sufijo (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el manifiesto de la colección registra esa restricción de formato en lugar de reclamar control de bytes en crudo. Los hashes y la ruta del hallazgo original se documentan en el `MANIFEST.json` a nivel de colección.

## Capacidades

- No es un modelo generativo: no produce texto, código, razonamiento ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión ni audio.
- Su única función documentada es servir como muestra inerte para validar escáneres de seguridad que inspeccionan metadatos de modelos.

## Casos de uso

- Validación de escáneres de seguridad: el artefacto se usa como caso de prueba para comprobar que una herramienta detecta la clave `terratorch backbone_cache_dir` en los metadatos de un modelo y la clasifica correctamente como hallazgo AFW.
- Pruebas de regresión en pipelines de análisis de artefactos: permite verificar que el escáner sigue identificando la carga útil inerte `PWNED-INERT` tras cambios en el parser de safetensors o en el lector de model cards.
- Investigación académica sobre supply chain de modelos: sirve como muestra controlada para estudiar cómo se propagan vectores de metadatos entre repositorios de HuggingFace sin ejecutar código peligroso.
- Desarrollo de reglas de detección: los equipos de seguridad pueden usar el espécimen para ajustar firmas que distingan artefactos inertes de cargas útiles activas.
- Formación y concienciación: útil en entornos docentes para ilustrar riesgos de confianza en metadatos de modelos sin exponer infraestructura real.
- Verificación de aislamiento en sandboxes: al ejecutar solo `whoami` y escribir en `/tmp` o `$TMPDIR`, permite comprobar que un entorno de análisis confina correctamente las sondas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no es un modelo ejecutable.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica. El nombre del repositorio menciona vLLM, pero solo como contexto del hallazgo de seguridad, no como destino de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada, dado que se trata de un artefacto de investigación en seguridad y no de un modelo de IA.

## Limitaciones y advertencias

- No debe usarse en producción; la propia model card lo califica como `not-for-production`.
- No es un modelo de lenguaje: no genera texto ni responde a prompts.
- El recuento de 4 parámetros confirma que no contiene pesos útiles para inferencia.
- Licencia no especificada: no hay autorización explícita de uso comercial ni de redistribución.
- Riesgo de interpretación errónea: podría confundirse con un modelo real por su nombre y etiquetas (`timm_wrapper`, `safetensors`).
- Aunque la carga útil se declara inerte, cualquier ejecución de sondas en entornos no aislados debe tratarse con precaución y solo en sandboxes controlados.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no aplica a un artefacto de este tipo.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-afw-13-vllm-terratorch
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
