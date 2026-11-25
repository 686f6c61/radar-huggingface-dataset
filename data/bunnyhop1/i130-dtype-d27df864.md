# bunnyhop1/i130-dtype-d27df864

## Resumen

El repositorio `bunnyhop1/i130-dtype-d27df864` es un artefacto alojado en Hugging Face con fines de prueba interna, no un modelo de lenguaje funcional. La model card lo describe explícitamente como "I130 model metadata rendering test" con el marcador `d27df864`, y lo identifica como un "scan-owned disposable test repo", es decir, un repositorio desechable propiedad de un escáner automatizado. Los tags incluyen `i130marker` e `i130-xss-test`, lo que apunta a pruebas de renderizado de metadatos y de saneamiento de contenido en la plataforma.

El dato técnico declarado en safetensors indica un total de 2 parámetros, un valor que no corresponde a ningún modelo utilizable y que es coherente con un artefacto sintético de prueba. El tamaño del repositorio es de 0.0 GB, no hay pipeline declarado, no se especifican idiomas y las cifras de descargas y likes son cero. La licencia declarada es Apache 2.0.

Por todo ello, esta ficha documenta el artefacto tal y como aparece publicado, pero debe quedar claro que no existe información sobre arquitectura, entrenamiento, capacidades o rendimiento. Cualquier evaluación de uso real es imposible con los datos disponibles, y el repositorio no debe considerarse una base para aplicaciones en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 2 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; librería declarada llama.cpp |

## Arquitectura y entrenamiento

No hay información sobre arquitectura. El repositorio no incluye documentación técnica, configuración de modelo ni descripción de capas. El recuento de 2 parámetros totales en safetensors es incompatible con un transformer funcional y sugiere un tensor de prueba o un artefacto de validación de formato.

Tampoco se dispone de datos sobre corpus de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO u otras). La model card únicamente contiene metadatos de prueba (`i130-xss-test`, `i130marker`) y una nota de que el repositorio es desechable y propiedad de un escáner.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte para agentes o razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas soportados.
- No se declaran modos especiales (thinking mode, visión, audio).
- El artefacto parece orientado a pruebas de renderizado de metadatos en Hugging Face, no a inferencia.

## Casos de uso

- Validación de pipelines de carga de safetensors: el artefacto puede servir para comprobar que una herramienta de inspección lee correctamente el recuento de parámetros y los metadatos asociados, sin ejecutar inferencia real.
- Pruebas de saneamiento de model cards: dado el tag `i130-xss-test`, puede emplearse en entornos controlados para verificar que el visor de Hugging Face escapa correctamente contenido potencialmente malicioso en metadatos.
- Verificación de integración con llama.cpp: la librería declarada permite comprobar cómo trata una herramienta de carga un repositorio sin pesos utilizables y con recuento anómalo de parámetros.
- Automatización de auditorías de repositorios: útil como caso de prueba para escáneres que clasifican repositorios desechables o de prueba y evitan indexarlos como modelos reales.
- Pruebas de política de licencias: permite validar que un pipeline lee y propaga correctamente la licencia Apache 2.0 declarada en los metadatos.
- Formación y documentación interna: sirve como ejemplo de repositorio no apto para producción en guías de evaluación de modelos, ilustrando qué señales (cero descargas, tamaño 0.0 GB, parámetros irreales) indican un artefacto de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 2 parámetros declarados no existe un modelo funcional que cargar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: la librería declarada es llama.cpp, pero no hay pesos GGUF ni configuración que permita ejecución.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque el artefacto no constituye un modelo de lenguaje funcional y carece de especificaciones que permitan una comparación significativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio es un artefacto de prueba desechable, no un modelo entrenado; no debe usarse para inferencia ni en producción.
- El recuento de 2 parámetros totales es inconsistente con cualquier modelo de lenguaje utilizable.
- No hay información sobre sesgos, alucinación o calidad de salida porque no hay modelo subyacente documentado.
- No se declaran idiomas soportados, por lo que no puede garantizarse cobertura lingüística alguna.
- La licencia Apache 2.0 permite uso comercial del contenido publicado, pero al no existir pesos ni modelo funcional, esa permisibilidad no tiene aplicación práctica.
- Los tags `i130-xss-test` e `i130marker` sugieren contenido de prueba de seguridad; debe tratarse con cautela en entornos que rendericen metadatos sin saneamiento.
- Cero descargas y cero likes refuerzan la ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bunnyhop1/i130-dtype-d27df864
