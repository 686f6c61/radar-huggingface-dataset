# Kobyko/inzoi-cheat-trainer-unlocked

## Resumen

`Kobyko/inzoi-cheat-trainer-unlocked` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64 (un supuesto "trainer" o trampas para el videojuego *inZOI*) distribuido a través de la plataforma, con etiquetas propias de software de escritorio (`windows`, `windows-11`, `x64`, `portable`) en lugar de las habituales de pesos de modelos (`safetensors`, `transformers`, `pytorch`).

El artefacto declarado es un archivo `inzoi-cheat-trainer-unlocked-v1.2.0-win64.zip` de 8,9 MB que se distribuye protegido con contraseña y que, según la model card, debe ejecutarse como administrador. No existe información sobre arquitectura neuronal, parámetros, contexto, tokenizador ni proceso de entrenamiento, porque no hay ningún modelo detrás.

Desde el punto de vista de la evaluación técnica, este repositorio no es utilizable como modelo: carece de pipeline, pesos, configuración o código de inferencia. Su presencia en Hugging Face es relevante únicamente como ejemplo de contenido ajeno a la plataforma (software de terceros empaquetado como si fuera un modelo) y como posible vector de riesgo para quien descargue y ejecute el binario.

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
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido descrito en la model card es un ejecutable de Windows (`inzoi-cheat-trainer-unlocked-v1.2.0-win64.exe`, build `v1.9.6`/`DC3341`) empaquetado en un ZIP de 8,9 MB, con supuestos módulos de overlay, radar 2D, perfiles JSON y un "escáner de offsets dinámicos". Toda esa descripción corresponde a un trainer de videojuego, no a un modelo de lenguaje.

No hay datos sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación de modelado. El repositorio no incluye `config.json`, tokenizador, `safetensors` ni scripts de inferencia.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas de metadatos del repositorio, no idiomas de un modelo.
- No existe modo "thinking", ni capacidades de audio o vídeo.
- El único artefacto es un binario de Windows x64 que, según el autor, interactúa con el videojuego *inZOI*.

## Casos de uso

- **Ninguno como modelo de IA.** No es posible desplegarlo en vLLM, TGI, llama.cpp, Ollama ni ningún runtime de inferencia, porque no hay pesos ni grafo computacional.
- **Auditoría de contenido en Hugging Face.** Útil como caso de estudio de repositorios que se hacen pasar por modelos y que en realidad distribuyen ejecutables de escritorio.
- **Análisis de seguridad defensiva.** El paquete puede emplearse como muestra para estudiar patrones de distribución de binarios con contraseña en archivos ZIP, que es una técnica habitual para evadir análisis automatizados.
- **Formación en políticas de la plataforma.** Sirve para ilustrar qué tipo de contenido queda fuera del alcance de Hugging Face como hub de modelos.
- **Investigación de malware (entorno aislado).** Solo en una máquina virtual sin red y sin credenciales, para caracterizar el binario; nunca en un equipo de producción.
- **Documentación de riesgos de cadena de suministro.** Ejemplo de por qué conviene verificar el pipeline, los tags y el contenido de un repositorio antes de descargar artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM ni GPU: no hay inferencia neuronal que ejecutar.
- Requisitos declarados por el autor: Windows 10 (22H2) o Windows 11 (24H2), procesador x64 (Intel o AMD).
- No cabe en ninguna GPU consumer porque no es un modelo; el artefacto es un ejecutable de escritorio.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable.
- Latencia y throughput: no disponibles; el autor menciona cifras internas del binario (< 31 ms de respuesta de cambio de perfil, 97,9 % de consistencia del escáner de offsets) que no son verificables ni relevantes para un modelo.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `Kobyko/inzoi-cheat-trainer-unlocked` | Ejecutable Windows (no modelo) | no disponible | no disponible | MIT | `.zip` con `.exe` |
| Modelo de lenguaje open source típico (p. ej. familia Llama, Qwen, Mistral) | Pesos de transformer | Miles de millones | Miles de tokens | Licencias específicas | `safetensors`, GGUF |
| Modelo de visión-lenguaje open source típico | Transformer multimodal | Miles de millones | Miles de tokens | Licencias específicas | `safetensors` |

No existe comparación técnica posible con modelos de IA: la categoría del repositorio no es la de un modelo.

## Limitaciones y advertencias

- **No es un modelo de IA.** No debe tratarse como tal en ningún pipeline, evaluación o benchmark.
- **Riesgo de seguridad elevado.** Distribuir un `.exe` dentro de un ZIP protegido con contraseña y pedir ejecución como administrador es un patrón habitual en campañas de malware; el binario no es auditable a partir de la información disponible.
- **Contenido potencialmente fraudulento.** El repositorio promete descargas y valoraciones ("216K+ downloads", "5.0/5") que no se corresponden con las métricas reales de Hugging Face (0 descargas, 0 likes).
- **Licencia MIT engañosa en contexto.** La licencia MIT del repositorio no implica que el binario sea seguro ni que su uso sea legal respecto a los términos de servicio del videojuego *inZOI*.
- **Sin soporte ni mantenimiento.** Creado y actualizado el mismo día (2026-11-24), sin historial, sin issues y sin autor verificable.
- **Idiomas listados sin respaldo técnico.** Las etiquetas de idioma no corresponden a capacidades lingüísticas de ningún modelo.
- **No apto para producción.** No debe integrarse en sistemas de atención al cliente, generación de código ni ningún flujo que espere un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/inzoi-cheat-trainer-unlocked
- Releases del autor (referenciadas en la model card): https://github.com/idas46/inzoi-cheat-trainer-unlocked/releases/latest
- Paquete directo citado en la model card: https://github.com/idas46/inzoi-cheat-trainer-unlocked/releases/latest/download/inzoi-cheat-trainer-unlocked-v1.2.0-win64.zip
- Paper: no disponible
- Blog o demo: no disponible
