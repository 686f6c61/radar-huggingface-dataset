# kennnnnzx/dune-awakening-cheat-esp-2026

## Resumen

`kennnnnzx/dune-awakening-cheat-esp-2026` es un repositorio alojado en Hugging Face que, pese a su identificador y a las etiquetas de la plataforma (idiomas, licencia MIT), no contiene un modelo de inteligencia artificial. La model card describe un supuesto paquete ejecutable para Windows (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip`, 4,8 MB, protegido con la contraseña `2026`) presentado como una herramienta de trampas (cheat ESP, radar 2D, filtro de loot, smoothing de entrada) para el videojuego *Dune: Awakening*. No se declara arquitectura, parámetros, tokenizador, pesos ni pipeline de inferencia.

El artefacto se distribuye como binario `.exe` de 64 bits para Windows 10 (22H2) y Windows 11 (24H2), con instrucciones para ejecutarlo como administrador y desactivar advertencias de Windows Defender o SmartScreen. La model card emplea técnicas habituales de ingeniería social (insignias falsas de descargas y valoración, enlaces a repositorios de GitHub ajenos al identificador de Hugging Face, contraseña de descompresión) y no aporta ninguna documentación técnica verificable.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA: no hay pesos, no hay benchmarks, no hay licencia aplicable a un modelo y no existe evidencia de que el contenido sea seguro. Se documenta únicamente lo que el autor declara, marcando como «no disponible» todo dato técnico ausente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable nativo x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; no verificable) |
| Licencia | MIT (declarada en los metadatos; aplicabilidad dudosa al ser un binario de terceros) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe módulos de un programa de escritorio: «user-mode external core» con renderizado mediante Desktop Duplication sin hooks DLL internos, «stream-proof render layer» para excluir la superposición de capturas de OBS, ShadowPlay y Discord, «bezier input smoothing» con curvas humanizadas y comprobación de visibilidad, «hot-swap JSON profiles» con conmutación en menos de 18 ms, radar 2D con filtrado de objetos por rareza y una tecla de pánico (`END`) para liberar handles y terminar el proceso. Se mencionan cinco hilos de trabajo y una consistencia del 99,9 %, cifras no verificables y sin metodología asociada.

No se indica número de tokens, composición de dataset, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático. El binario se presenta con build `v3.4.9` (`C60D0F41EF`) y tamaño de 4,8 MB, lo que es incompatible con cualquier modelo de lenguaje actual.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Las capacidades descritas pertenecen a un supuesto cheat para un videojuego: ESP (detección visual de entidades), radar 2D, filtro de loot por rareza, suavizado de entrada y perfiles de configuración conmutables.
- Los multilingües listados en los metadatos (14 idiomas) no se corresponden con ninguna funcionalidad descrita en la model card.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no admite casos de uso de inferencia, generación o análisis.
- Cualquier uso del binario descrito (ejecución como administrador en Windows) queda fuera del ámbito de esta ficha y conlleva riesgos de seguridad no evaluados.
- No se han identificado escenarios legítimos de despliegue en producción, investigación o docencia asociados a este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas cifras declaradas por el autor (respuesta de conmutación de perfiles inferior a 18 ms, consistencia del 99,9 %, cinco hilos de trabajo) carecen de metodología, entorno de prueba y reproducibilidad, por lo que no se recogen como benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados del artefacto: Windows 10 (22H2) o Windows 11 (24H2), arquitectura x64, ejecución como administrador, 7-Zip o WinRAR para descomprimir con contraseña `2026`.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable: el repositorio no contiene un modelo de IA, sino un supuesto ejecutable de trampas para videojuegos. No se han identificado alternativas legítimas de código abierto con las que establecer una comparación técnica de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: los metadatos de Hugging Face (idiomas, licencia MIT, etiquetas) no se corresponden con el contenido real.
- La model card incluye enlaces a repositorios de GitHub de terceros (`Roussel10024/inzoi-cheat-trainer-mod-menu`, `Rebecca26040/dune-awakening-cheat-esp-2026`) distintos del identificador de Hugging Face, lo que dificulta la trazabilidad del artefacto.
- El binario se distribuye comprimido con contraseña y con instrucciones para ejecutarlo como administrador y sortear alertas de Windows Defender y SmartScreen; este patrón es habitual en campañas de distribución de software malicioso y no puede verificarse su inocuidad.
- No hay verificación de integridad (hashes, firmas), ni código fuente, ni auditoría de seguridad publicada.
- La licencia MIT declarada no garantiza derechos sobre componentes de terceros ni sobre el videojuego objetivo; el uso de cheats puede infringir los términos de servicio del juego.
- Riesgo de alucinación: no aplica al no ser un modelo generativo; el riesgo relevante es de suplantación y engaño en la documentación.
- No debe utilizarse como referencia en evaluaciones de modelos de IA ni citarse como modelo open source.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kennnnnzx/dune-awakening-cheat-esp-2026
- Repositorio de GitHub citado en la model card: https://github.com/Rebecca26040/dune-awakening-cheat-esp-2026
- Repositorio de GitHub citado para la descarga: https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Resultado de búsqueda web proporcionado (sin relación con el artefacto): https://cdmo.jp/biotechs/fermelanta/
