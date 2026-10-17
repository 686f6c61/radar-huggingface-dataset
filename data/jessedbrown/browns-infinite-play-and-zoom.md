# Jessedbrown/Browns-infinite-play-and-zoom

## Resumen

El repositorio `Jessedbrown/Browns-infinite-play-and-zoom` no contiene un modelo de inteligencia artificial, sino una pieza de software interactiva de un solo archivo: una página HTML con JavaScript y canvas 2D que dibuja sólidos translúcidos sobre un centro libre y hace zoom infinito a coste de cómputo constante. El autor, Jesse Daniel Brown (OP-JESSE), la publica en HuggingFace bajo la etiqueta `region:us`, con cero descargas y cero likes en el momento de la consulta, y sin pipeline, licencia ni idiomas declarados.

El propio README describe el mecanismo: cada anillo es el anillo anterior bajo una única transformación, de modo que la profundidad de la recursión crece sin límite mientras el trabajo por fotograma se mantiene plano. El autor afirma que esto se debe a que los coeficientes de brazo `(2, −1, −1)` suman cero, lo que hace que la relación sea afín y que el centro sea colocable en cualquier punto sin coste. Se trata de una afirmación matemática del autor, no de una propiedad verificada de forma independiente en la información disponible.

La relevancia de esta ficha es, por tanto, la de documentar una entrada atípica en HuggingFace: no es un checkpoint, no tiene pesos, no se puede ejecutar con vLLM ni llama.cpp y no sirve para tareas de generación de texto. Encaja en la categoría de demo web autocontenida con dependencia cero, ejecutable abriendo `index.html` en un navegador. La búsqueda web asociada no devolvió ningún resultado relevante sobre el proyecto: todos los enlaces recuperados corresponden a páginas de ayuda de Gmail y no guardan relación con el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo de IA; aplicación web de un solo archivo en HTML + JavaScript con canvas 2D |
| Parámetros totales | No aplicable (no contiene pesos ni red neuronal) |
| Parámetros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantización | No aplicable |
| Idiomas soportados | No disponible (la interfaz del README está en inglés) |
| Licencia | No disponible |
| Formato de pesos | No aplicable; el artefacto distribuido es un único `index.html` |

## Arquitectura y entrenamiento

No existe entrenamiento ni red neuronal. El artefacto es un archivo HTML autocontenido que, según el README, no requiere servidor, red, GPU, cuenta ni gestor de paquetes. La lógica se ejecuta íntegramente en el navegador y su bucle de fotogramas está ligado a la frecuencia de refresco de la pantalla: cuando la pestaña se oculta no hay dibujado y la animación se detiene, reanudándose exactamente donde quedó porque no acumula estado.

El autor describe tres frentes de onda que parten de cada nivel a tres velocidades distintas: `−1/3` (sombra, instantánea, descrita como restricción y no como señal), `0` (luz, `c/n`) y `+1/3` (sonido, `v_s`). Con medio `n = 1,333` y profundidad de 40 m, la model card reporta un viaje de ida y vuelta de 0 s exactos para la sombra, 355,7128 ns para la luz (224,901 × 10⁶ m/s) y 53,9811 ms para el sonido (1 482 m/s), con una relación luz:sonido de 151 755:1. La innovación técnica que reivindica el autor es que la relación afín del sistema hace que la estructura sea autosimilar bajo la transformación que la genera, de manera que el nivel `n+1` es el nivel `n` a otra escala y nunca se recalcula un nivel, solo se redibuja. El README también documenta un error corregido (`IndexSizeError` por un `dt` negativo al reanudar la pestaña) y su solución mediante `Math.max(0, Math.min(0.05, dt))` junto con un redondeo a la baja del radio.

## Capacidades

- Renderizado interactivo de sólidos translúcidos (cubo, pirámide y esfera, uno por nivel) en canvas 2D.
- Zoom recursivo sin límite de profundidad con coste de cómputo por fotograma constante, según las mediciones del autor.
- Tres frentes de onda expansivos por nivel, con velocidades relativas de `−1/3`, `0` y `+1/3`.
- Ciclado de color en orden R → G → B descrito como "orden de manivela".
- Anillos que se desvanecen en el borde, descritos como escape.
- Ejecución sin dependencias: no requiere servidor, red, GPU, cuenta ni gestor de paquetes.
- Pausa automática cuando la pestaña deja de estar visible y reanudación sin pérdida de estado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Demostración didáctica de recursión y autosimilitud: el archivo puede abrirse en un aula sin instalar nada, y el contador de nivel y de celdas (3ⁿ) permite ilustrar cómo crece la profundidad lógica sin que crezca el trabajo por fotograma.
- Material de exposición en ferias o talleres sin infraestructura: al copiarse a un lápiz USB y ejecutarse con doble clic, funciona en equipos sin permisos de administrador ni acceso a internet.
- Prueba de estrés de bucles de animación en navegador: el README documenta cómo se comporta el bucle ante la suspensión de pestaña y el `dt` negativo, lo que lo convierte en un caso de prueba reproducible de gestión de delta de tiempo.
- Recurso de arte generativo de referencia: sirve como punto de partida para estudiar transformaciones autosimilares aplicadas a geometría y color en canvas.
- Ejemplo de distribución sin puertas de acceso: útil para discutir modelos de publicación de software donde el artefacto no depende de un registro, un servidor ni una cuenta.
- Base para experimentos propios de recursión visual: al ser un único archivo sin dependencias, el código se puede copiar, reescribir a mano o imprimir y adaptar sin resolver un grafo de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de aprendizaje automático en la información disponible, ya que no se trata de un modelo de IA. La model card incluye una tabla de medidas del propio autor obtenidas ejecutando el bucle de fotogramas directamente, que se reproduce a continuación tal cual figura en el README:

| Tiempo | Nivel | Celdas (3ⁿ) | Anillos por fotograma | Escape | Ondas activas |
|---|---|---|---|---|---|
| 0,3 s | 0 | 1 | 5 | 0 | 2 |
| 5,1 s | 1 | 3 | 4 | 1 | 3 |
| 14,5 s | 3 | 27 | 5 | 3 | 3 |
| 28,5 s | 6 | 729 | 5 | 6 | 3 |

El autor resume el resultado afirmando que, al pasar del nivel 0 al 6, las celdas crecen de 1 a 729 mientras los anillos dibujados por fotograma se mantienen en 5 y las ondas nunca superan 3. Son mediciones declaradas por el autor, sin metodología de medición publicada ni verificación independiente.

## Requisitos de hardware

- VRAM: no aplica; la model card afirma explícitamente que no se necesita GPU.
- GPU recomendadas: ninguna; no hay componente de cómputo acelerado.
- Ejecución en hardware de consumo: cualquier navegador moderno con soporte de canvas 2D; el autor indica que basta con abrir `index.html` con doble clic.
- Opciones de despliegue: doble clic sobre el archivo local, copia en lápiz USB, envío por correo electrónico, impresión del código fuente o publicación como página estática en GitHub Pages en `https://jessebrown1980.github.io/Browns-infinite-play-and-zoom/`. No es compatible con vLLM, llama.cpp, Ollama ni TGI porque no hay pesos que cargar.
- Latencia y throughput: no disponibles como métricas de inferencia. La única referencia de rendimiento es el coste plano por fotograma descrito en la sección anterior, sujeto a la frecuencia de refresco del monitor.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifica ningún modelo comparable, y la categoría del artefacto (demo web de un solo archivo, sin pesos ni API de inferencia) no admite comparación significativa con modelos de lenguaje de parámetros y contexto comparables. La búsqueda web asociada no devolvió ningún proyecto relacionado.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural y no puede integrarse en pipelines de inferencia ni en flujos de agentes.
- La licencia no está declarada en HuggingFace, lo que impide determinar si el uso comercial, la redistribución o la modificación están permitidos.
- El repositorio registra cero descargas y cero likes, por lo que no existe validación de la comunidad ni revisión externa del contenido.
- Las fechas del repositorio son incoherentes en la información disponible: figura como creado el 2026-10-16 y actualizado el 2026-08-07, es decir, con una actualización anterior a la creación.
- Las afirmaciones físicas y matemáticas del README (sombra que llega antes de que salga el pulso, gratuidad del descenso, supervivencia del cierre en profundidad 81, comportamiento en enteros exactos frente a coma flotante) son tesis del autor y no están verificadas de forma independiente en la información proporcionada.
- La tabla de rendimiento procede exclusivamente de mediciones declaradas por el autor, sin metodología publicada ni reproducción por terceros.
- El README documenta un fallo previo en producción (`IndexSizeError` por radio negativo al reanudar desde suspensión); aunque el autor indica que está corregido, conviene tenerlo en cuenta al reutilizar el bucle de animación.
- La única comprobación de seguridad relevante es que el archivo se ejecuta sin red ni servidor, lo que reduce la superficie de exposición, pero no exime de revisar el código antes de abrirlo en un entorno corporativo.
- No se declaran idiomas soportados en la ficha de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/Browns-infinite-play-and-zoom
- Demo en GitHub Pages: https://jessebrown1980.github.io/Browns-infinite-play-and-zoom/
- Página "the bridge", índice de todo lo público del autor: https://jessebrown1980.github.io/the-bridge-to-all-of-it/
- Repositorio `does-the-closure-survive-81-levels`: https://github.com/JesseBrown1980/does-the-closure-survive-81-levels
- Repositorios compañeros citados en la model card, sin URL directa en la información disponible: `free-at-all-levels`, `light-boat-engine-ships-with-oils`, `The-Brown-Light-erdos-Engine-block-powered-by-light`, `the-browns-solution-to-erods-o0O-nx3-6-for-1-with--1-3`, `one-click`, `how-and-why-the-system-works`, `the-leaves-are-not-the-message`, `raw-data`.
- Resultados de la búsqueda web: no relevantes; todas las entradas devueltas corresponden a páginas de ayuda de Google sobre Gmail y no guardan relación con el proyecto.
