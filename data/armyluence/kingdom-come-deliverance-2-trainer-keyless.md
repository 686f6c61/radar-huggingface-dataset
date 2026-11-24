# armyluence/kingdom-come-deliverance-2-trainer-keyless

## Resumen

No disponible. El repositorio identificado como `armyluence/kingdom-come-deliverance-2-trainer-keyless` no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable para Windows distribuido a través de un archivo ZIP alojado en GitHub. La model card describe lo que se presenta como una herramienta de tipo "trainer" (modificador de memoria para videojuegos) orientada al título Kingdom Come Deliverance 2, con funciones de overlay, radar y perfiles JSON.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador, datos de entrenamiento ni pesos en formato safetensors o GGUF. Los tags de Hugging Face (`windows`, `x64`, `portable`) confirman que se trata de un binario empaquetado, no de un modelo fundacional. Cualquier evaluación como modelo de lenguaje, visión o razonamiento resulta, por tanto, inaplicable.

Esta ficha se redacta únicamente para documentar la ausencia de un modelo evaluable y advertir sobre los riesgos asociados a la distribución: enlaces a ejecutables de terceros, contraseñas de descompresión incrustadas y nombres de archivo que no coinciden con el supuesto producto (el ZIP se denomina `monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`, referido a otro juego).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de 4,8 MB) |

## Arquitectura y entrenamiento

No disponible. No se describe ninguna arquitectura de red neuronal, corpus de entrenamiento, proceso de alineación (RLHF, DPO) ni innovación técnica de inferencia. La model card menciona conceptos propios de herramientas de modding de videojuegos —"user-mode external core", "Desktop Duplication rendering", "dynamic offset scanner", "hot-swap JSON profiles"— que no guardan relación con el entrenamiento o la inferencia de modelos de lenguaje.

El artefacto distribuido se presenta como un ejecutable de 4,8 MB (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, build `v3.2.7`/`C98C31`) que requiere extracción con contraseña `2026` y ejecución como administrador. No se aporta información sobre compilación reproducible, firma de código ni análisis de dependencias.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos no están respaldadas por ninguna evaluación; probablemente reflejan los idiomas de la interfaz del ejecutable.
- Las funciones descritas (overlay a 144 Hz, ESP con cajas 2D/3D, radar 2D, filtro de loot, perfiles JSON) corresponden a un trainer de videojuego, no a un modelo de IA.

## Casos de uso

- No disponible como modelo de IA. No se identifican aplicaciones legítimas de inferencia, generación o análisis que puedan apoyarse en este repositorio.
- Auditoría de seguridad: un equipo podría inspeccionar el ZIP y el ejecutable en un entorno aislado para comprobar su comportamiento, dado que se distribuye con contraseña y sin firma.
- Documentación de riesgos en plataformas de modelos: registrar el caso como ejemplo de contenido no relacionado con IA alojado en Hugging Face.
- Formación en higiene de cadena de suministro: usar el ejemplo para ilustrar por qué no deben ejecutarse binarios de origen desconocido con privilegios de administrador.
- Investigación de ingeniería social: analizar el patrón de nombres cruzados (Kingdom Come Deliverance 2 frente a Monster Hunter Wilds) como señal de alarma.
- No se recomienda ningún caso de uso en producción, desarrollo o investigación que implique ejecutar el binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows x64 (Windows 11 mencionado en los tags).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la model card cita "< 11 ms" de respuesta del overlay y "98,3 % de consistencia", métricas no verificables y sin metodología publicada.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, dado que el artefacto no es un modelo de IA. Frente a modelos de lenguaje de propósito general (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparación carece de sentido: no hay parámetros, contexto, benchmarks ni pesos evaluables.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal en un catálogo o pipeline sería un error de clasificación.
- Distribución mediante ZIP con contraseña (`2026`) y ejecución como administrador: patrón habitual en campañas de malware.
- El nombre del archivo descargable (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`) no coincide con el producto anunciado (Kingdom Come Deliverance 2), lo que indica copia o reutilización de material ajeno.
- Los enlaces apuntan a repositorios de GitHub de terceros (`martina1713`, `Ricardof68435`) distintos del autor declarado en Hugging Face (`armyluence`).
- Cero descargas y cero likes en Hugging Face en el momento de la consulta; sin historial ni comunidad que valide el artefacto.
- Licencia MIT declarada, pero sin archivo LICENSE verificable ni titularidad clara del código.
- Riesgo de alucinación, sesgos o limitaciones de contexto: no aplica, al no existir modelo generativo.
- No debe ejecutarse en máquinas de producción, entornos corporativos ni equipos con datos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/armyluence/kingdom-come-deliverance-2-trainer-keyless
- Repositorio GitHub citado en la model card: https://github.com/Ricardof68435/kingdom-come-deliverance-2-trainer-keyless
- Repositorio GitHub del archivo ZIP: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026
- Descarga directa citada: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible
