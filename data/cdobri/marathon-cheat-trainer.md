# cdobri/marathon-cheat-trainer

## Resumen

`cdobri/marathon-cheat-trainer` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un supuesto "trainer" (herramienta de trampas) para el videojuego *Marathon*, empaquetado como un ejecutable portable para Windows 10/11 de 64 bits. El autor declarado es el usuario `cdobri`, con licencia MIT y 0 descargas y 0 likes en el momento de la consulta.

El repositorio no contiene pesos de modelo, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje: la model card es en realidad una página de descarga que distribuye un archivo `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip` (4,8 MB) alojado en un repositorio de GitHub de terceros, protegido con contraseña y con instrucciones para ejecutarlo como administrador. Los metadatos de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y el pipeline no corresponden a un modelo entrenado.

Por tanto, esta ficha no puede documentar arquitectura, entrenamiento, capacidades ni benchmarks de un modelo inexistente. Se documenta lo que el repositorio declara, se señalan las señales de riesgo evidentes y se advierte de que el binario distribuido no debe ejecutarse. La relevancia de esta entrada es exclusivamente como caso de contenido ajeno a la categoría de modelos open source y potencialmente malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo distribuye un `.zip` con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido descrito en la model card es un ejecutable `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` (build declarada `v4.3.7` / `EDB19E`), empaquetado en un ZIP de 4,8 MB con contraseña `2026`, que se anuncia como "trainer" con módulos de escaneo de offsets, overlay externo, radar 2D y perfiles JSON. Ninguno de estos componentes es un modelo de lenguaje ni se acompaña de dataset, tokens de entrenamiento, RLHF, DPO ni innovación técnica alguna verificable.

La model card mezcla nombres de proyectos y juegos distintos (*Marathon*, *Kingdom Come: Deliverance 2*), incluye insignias de descargas infladas ("108K+") y enlaces de descarga que apuntan a repositorios de GitHub de usuarios no relacionados con el autor declarado en Hugging Face. Esta combinación es típica de páginas de distribución de software no verificado y de posible malware.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales; los códigos de idioma son metadatos del repositorio, no del modelo.
- El contenido del repositorio se limita a la distribución de un ejecutable de Windows.

## Casos de uso

- No procede. El repositorio no contiene un modelo de IA y no tiene aplicaciones legítimas en pipelines de desarrollo, investigación o producción.
- Uso como muestra para formación en detección de repositorios sospechosos en Hugging Face: se puede analizar la estructura de la model card (insignias falsas, contraseña en el ZIP, enlaces a GitHub de terceros) como ejemplo de ingeniería social.
- Auditoría de cadena de suministro: sirve para ilustrar por qué conviene revisar autor, historial, descargas y enlaces antes de ejecutar binarios descargados desde plataformas de modelos.
- No se recomienda ningún otro uso. En particular, no debe descargarse ni ejecutarse el ZIP ni el EXE asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay modelo que inferir.
- El único artefacto distribuido es un ejecutable de Windows 10/11 x64 de 4,8 MB comprimido; sus requisitos reales de hardware no están documentados de forma verificable.
- No requiere GPU, VRAM ni aceleradores; cualquier afirmación sobre latencia o throughput en la model card (por ejemplo, "< 26 ms", "< 10 ms", "< 35 ms") no es contrastable y corresponde a un software de terceros, no a un modelo.
- Opciones de despliegue con vLLM, llama.cpp, Ollama o TGI: no disponibles, al no existir pesos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cdobri/marathon-cheat-trainer` | No es un modelo de IA (binario Windows) | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Modelos de lenguaje open source (p. ej. familias Llama, Qwen, Mistral) | Transformer / MoE | desde ~1B hasta >100B | 8K–1M según variante | licencias abiertas variables | Hugging Face, amplia adopción |
| Modelos de código abierto para agentes (p. ej. variantes instruct) | Transformer | 7B–70B | 32K–128K | Apache 2.0 / MIT / otras | Hugging Face, vLLM, llama.cpp |

La comparación carece de sentido técnico: el repositorio no es comparable con ningún modelo de lenguaje porque no contiene pesos ni arquitectura.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con MMLU, HumanEval ni GSM8K.
- Señales de riesgo: la model card incluye una contraseña para descomprimir el ZIP, instrucciones para ejecutar el `.exe` como administrador y enlaces de descarga a repositorios de GitHub de usuarios no vinculados al autor del repo de Hugging Face.
- Inconsistencia de nombres: se mezclan *Marathon* y *Kingdom Come: Deliverance 2*, lo que sugiere contenido copiado o reutilizado de otras páginas.
- Insignias de descargas ("108K+") no verificables y contradictorias con las 0 descargas registradas en Hugging Face.
- Riesgo de malware: ejecutar binarios de origen no verificado con privilegios de administrador puede comprometer el sistema. No debe descargarse ni ejecutarse el ZIP ni el EXE.
- La licencia MIT declarada no otorga garantías sobre el contenido distribuido ni sobre su legalidad en relación con los juegos a los que hace referencia.
- Posible incumplimiento de los términos de servicio de Hugging Face y de los acuerdos de licencia de los videojuegos mencionados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cdobri/marathon-cheat-trainer
- Enlaces de descarga citados en la model card (no recomendados, no verificar su contenido): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace citado en la model card (no recomendado): https://github.com/OzlemLopez/marathon-cheat-trainer/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
