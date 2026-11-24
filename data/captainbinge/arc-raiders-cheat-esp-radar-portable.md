# CaptainBinge/arc-raiders-cheat-esp-radar-portable

## Resumen

No es un modelo de IA. El repositorio `CaptainBinge/arc-raiders-cheat-esp-radar-portable` alojado en Hugging Face no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. Se trata de un paquete ejecutable para Windows distribuido a través de la plataforma, etiquetado como "cheat ESP radar portable" para el videojuego Arc Raiders, con un ejecutable denominado `rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe` y un archivo comprimido de 4,8 MB protegido con contraseña.

El contenido de la model card es material promocional de un software de trampas multijugador (ESP, radar 2D, filtrado de loot, suavizado de entrada tipo bezier), no documentación técnica de un modelo. Las etiquetas del repositorio (`windows`, `windows-11`, `x64`, `portable`) y la ausencia de pipeline confirman que no hay inferencia posible: no existe un `pipeline_tag` válido ni artefactos de modelo.

Esta ficha se redacta por rigor documental: se detalla lo que el repositorio declara y se advierte de que no es un modelo de IA evaluable. Cualquier uso previsto como modelo de lenguaje, visión o agente es inviable con este contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el repositorio distribuye un ejecutable de Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, referidos a la documentación del paquete, no a capacidades lingüísticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio no contiene ficheros `config.json`, `model.safetensors`, `tokenizer.json` ni ningún artefacto equivalente. El contenido descrito en la model card corresponde a un supuesto programa de trampas para el juego Arc Raiders: núcleo externo en modo usuario, capa de renderizado "stream-proof" para evadir capturas de OBS, ShadowPlay y Discord, escáner dinámico de offsets con resolución de firmas de punteros tras parches del juego, perfiles JSON con intercambio en caliente y suavizado de entrada bezier.

Los únicos "datos técnicos" declarados son cifras de marketing no verificables (polling a 241 Hz y 423 Hz, consistencia del 97,3 % y 97,6 %, uso de RAM inferior a 53 MB, build `v3.6.3` con firma `4858F4`). No hay información sobre datasets, tokens de entrenamiento, RLHF, DPO ni ninguna innovación en el sentido en que se aplica a modelos de IA.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma del repositorio son metadatos de la model card.
- No hay modo thinking, audio, vídeo ni ninguna modalidad de inferencia.
- El único contenido funcional descrito es un ejecutable de Windows orientado a trampas en un videojuego multijugador.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA. El repositorio no permite desplegar inferencia, evaluación de benchmarks ni integración en pipelines de datos.
- No es adecuado para atención al cliente, generación de código, análisis documental, búsqueda semántica ni ninguna tarea de procesamiento de lenguaje natural.
- No es adecuado para investigación en IA: no hay pesos, arquitectura ni resultados reproducibles.
- Su uso declarado (trampas en un juego multijugador) vulnera habitualmente los términos de servicio del videojuego y puede conllevar el baneo de cuentas.
- La distribución de ejecutables sin verificar procedentes de repositorios anónimos implica un riesgo elevado de malware; la contraseña fija del archivo (`2026`) y los enlaces a binarios alojados en GitHub no aportan garantía alguna de integridad.
- No debe emplearse en entornos corporativos, educativos ni de producción bajo ninguna circunstancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (97,3 % y 97,6 % de "consistencia", 241 Hz y 423 Hz de polling, menos de 53 MB de RAM) son afirmaciones promocionales del autor sin metodología, sin conjunto de evaluación y sin posibilidad de reproducción; no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- El único requisito declarado es un sistema Windows 10 u 11 de 64 bits para ejecutar el binario distribuido.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Comparar con LLM abiertos (Llama, Mistral, Qwen, Gemma) carece de sentido: no comparten categoría, artefactos ni finalidad.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede evaluar, ajustar ni desplegar como tal.
- La model card incluye enlaces a binarios alojados en repositorios de GitHub de terceros y una contraseña fija de descompresión; este patrón es habitual en campañas de distribución de malware.
- El contenido declara funcionalidades de trampa en un videojuego multijugador, lo que puede infringir los términos de servicio del juego y la legislación aplicable en materia de fraude informático según la jurisdicción.
- La licencia MIT del repositorio se refiere únicamente a los metadatos y a la model card; no otorga garantía alguna sobre el binario distribuido ni sobre su legalidad.
- No hay verificación de autoría, trazabilidad de build ni firma criptográfica del ejecutable.
- Riesgo de alucinación: no aplica, al no existir modelo generativo.
- No debe descargarse ni ejecutarse en equipos personales o corporativos sin un análisis previo en un entorno aislado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CaptainBinge/arc-raiders-cheat-esp-radar-portable
- Enlaces a binarios citados en la model card (no verificados, no recomendados): `https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip` y `https://github.com/isabellama84854/arc-raiders-cheat-esp-radar-portable/releases/latest`
- No se han encontrado papers, blogs técnicos, repositorios de código ni demos asociadas a un modelo de IA en la información disponible.
