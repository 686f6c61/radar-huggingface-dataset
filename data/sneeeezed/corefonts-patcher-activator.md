# SNEEEEZED/corefonts-patcher-activator

## Resumen
El repositorio `SNEEEEZED/corefonts-patcher-activator` no contiene un modelo de inteligencia artificial. Se trata de un paquete alojado en Hugging Face cuyo contenido es un ejecutable y un archivo ZIP para plataformas Windows 10 (22H2) y Windows 11 (24H2) de 64 bits, etiquetado como "portable" y "corefonts-patcher-activator". No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La model card describe un supuesto parcheador/activador de fuentes Core y, de forma contradictoria, enlaza a binarios con nombres de *cheat* para el videojuego Marvel Rivals (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe` y su `.zip`), alojados en repositorios de GitHub de terceros. Esta discrepancia entre el nombre del repositorio, las etiquetas y los artefactos enlazados es una señal clara de contenido malicioso o de spam, no de un modelo utilizable.

Desde la perspectiva de evaluación de modelos, esta ficha no puede aportar especificaciones de arquitectura, contexto, cuantización ni rendimiento porque no existe ningún modelo subyacente. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su único propósito aparente es distribuir software ejecutable potencialmente peligroso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un `.exe` y un `.zip` para Windows x64) |

## Arquitectura y entrenamiento
No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido descrito en la model card es un ejecutable de Windows (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v3.2.4` / `1D123A`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. Las etiquetas del repositorio (`windows`, `windows-11`, `x64`, `portable`, `corefonts-patcher-activator`) describen software de escritorio, no un modelo de lenguaje.

No hay información sobre datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica de modelado. Cualquier referencia a "overlay a 144 Hz", "radar 2D", "panic key" o "stream-proof render layer" en la model card corresponde a funcionalidades de un supuesto *cheat* para videojuegos y no guarda relación con IA generativa.

## Capacidades
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo de IA.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son metadatos del repositorio.
- El artefacto enlazado se presenta como un ejecutable de Windows con supuestas funciones de overlay, ESP, radar y aimbot para Marvel Rivals, según la propia model card.
- No se debe ejecutar el binario: la discrepancia entre el nombre del repositorio y el contenido enlazado, junto con la contraseña fija del ZIP y los enlaces a repositorios de terceros, es un patrón habitual de distribución de malware.

## Casos de uso
- Ninguno legítimo en el ámbito de IA. El repositorio no ofrece un modelo desplegable.
- Auditoría de seguridad: analizar el ZIP y el ejecutable en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier acción.
- Denuncia y bloqueo: reportar el repositorio a Hugging Face y a GitHub por suplantación de identidad y distribución de software potencialmente malicioso.
- Formación en detección de phishing: usar la model card como ejemplo de incoherencia entre metadatos (nombre "corefonts-patcher") y artefactos enlazados (nombres de *cheat*).
- Monitorización de supply chain: incluir este tipo de repositorios en listas de denylist para pipelines que indexan Hugging Face automáticamente.
- Investigación de spam en plataformas de modelos: documentar cómo se abusa de las etiquetas y de la licencia MIT para dar apariencia de legitimidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No existe ningún modelo subyacente que pueda evaluarse con MMLU, HumanEval, GSM8K ni ninguna otra métrica de IA.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica; no hay modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisitos del artefacto descrito: Windows 10 (22H2) o Windows 11 (24H2) de 64 bits, según la model card; no se recomienda su ejecución.

## Comparativa con modelos similares
No disponible. No existe una categoría de modelos comparable porque este repositorio no contiene un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o multimodal sería engañosa.

## Limitaciones y advertencias
- No es un modelo de IA: no puede usarse para inferencia, fine-tuning ni evaluación de capacidades.
- Riesgo de seguridad alto: el repositorio enlaza a ejecutables de Windows alojados en GitHub de terceros, con nombres que sugieren *cheats* para videojuegos y una contraseña fija (`2026`) para el ZIP, patrón típico de evasión de análisis automáticos.
- Incoherencia de identidad: el nombre del repositorio ("corefonts-patcher-activator") no coincide con los artefactos enlazados ("marvel-rivals-cheat-esp-aimbot-2026"), lo que indica suplantación o spam.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre el binario distribuido ni sobre su legalidad en la jurisdicción del usuario.
- El uso de *cheats* en videojuegos multijugador puede violar los términos de servicio y la legislación aplicable; la distribución de malware es un delito en muchas jurisdicciones.
- Los códigos de idioma del repositorio no implican soporte lingüístico real.
- No ejecutar el `.exe` ni extraer el `.zip` fuera de un sandbox aislado y sin red.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/SNEEEEZED/corefonts-patcher-activator
- Enlace de descarga del ZIP citado en la model card (no recomendado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no recomendado): https://github.com/thomasfontana8267/corefonts-patcher-activator/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios oficiales de un modelo de IA asociados a este identificador.
